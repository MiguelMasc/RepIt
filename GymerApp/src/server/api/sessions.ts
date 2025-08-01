'use server';

import {z} from 'zod';
import {db} from '@/drizzle/db';
import {auth} from '@clerk/nextjs/server';
import {v4 as uuidv4} from 'uuid';
import {eq, SQL} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {sessionFormSchema} from '@/schema/session';
import {SessionsTable} from '@/drizzle/schema/index';
import Anthropic from '@anthropic-ai/sdk';

/**
 * @typedef {Object} Session
 * @property {string} session_id - Unique identifier for the session.
 * @property {string} name - Name of the session.
 * @property {string} type - Type/category of the session.
 * @property {Date} date - Date of the session.
 * @property {string} session_data - Raw session data.
 */
export interface Session {
  session_id: string;
  name: string;
  type: string;
  date: Date;
  session_data: string;
}

export interface AISession {
  name: string;
  type: string;
  date: Date;
  parsed_data: unknown;
}

export interface AISessionParameters {
  keywords?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Anthropic client setup
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Fetches the session history for the authenticated user.
 * @returns {Promise<Session[]>} List of user sessions.
 */
export async function getSessionHistory(): Promise<Session[]> {
  const {userId, redirectToSignIn} = auth();
  let sessions: Session[] = [];

  if (userId === null) {
    redirectToSignIn();
    return sessions;
  }
  sessions = await db.query.SessionsTable.findMany({
    where: ({user_id}, {eq}) => eq(user_id, userId),
    orderBy: ({date}, {desc}) => desc(date),
    columns: {
      user_id: false, //Exclude user_id from results
    },
  });

  return sessions;
}

/**
 * Creates a new session for the authenticated user.
 * @param {z.infer<typeof sessionFormSchema>} dirty - Input data for session creation.
 * @returns {Promise<undefined | {error: boolean}>} Error object or undefined on success.
 */
export async function createSession(
  dirty: z.infer<typeof sessionFormSchema>,
): Promise<undefined | {error: boolean}> {
  const {userId} = auth();
  const {success, data} = sessionFormSchema.safeParse(dirty);

  if (!success || userId === null) {
    return {error: true};
  }

  const sessionId = uuidv4();
  const {type, name, date, session_data} = data;
  console.log(date);

  // Parse session_data using Claude Haiku
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Parse this data string into valid JSON, such that you can then efficiently extract key data from it. Only respond with the JSON, no other text: ${data.session_data}`,
      },
    ],
  });

  // Extract JSON from Haiku's response
  // The content will be in the first content block's value
  const parsed_data =
    message.content[0].type === 'text' ? message.content[0].text : '';

  await db
    .insert(SessionsTable)
    .values({
      session_id: sessionId,
      user_id: userId,
      type: type,
      name: name,
      date: date,
      session_data,
      parsed_data,
    })
    .returning();

  revalidatePath('/sessions');
  return undefined;
}

/**
 * Deletes an existing session by its ID.
 * @param {string} session_id - The unique identifier of the session to delete.
 * @returns {Promise<void>} Resolves when the session is deleted.
 */
export async function deleteSession(
  deletedSessionId: string,
): Promise<undefined | {error: boolean}> {
  try {
    await db
      .delete(SessionsTable)
      .where(eq(SessionsTable.session_id, deletedSessionId));

    revalidatePath('/sessions');
    return undefined;
  } catch (error) {
    console.error('Error deleting session:', error);
    return {error: true};
  }
}

/**
 * Updates an existing session by its ID.
 * @param {z.infer<typeof sessionFormSchema>} dirty - New session details.
 * @param {string} session_id - The unique identifier of the session to update.
 * @returns {Promise<undefined | {error: boolean}>} Error object or undefined on success.
 */
export async function updateSession(
  sessionId: string,
  dirty: z.infer<typeof sessionFormSchema>,
): Promise<undefined | {error: boolean}> {
  const {userId, redirectToSignIn} = auth();

  if (userId === null) {
    redirectToSignIn();
    return {error: true};
  }

  const {success, data} = sessionFormSchema.safeParse(dirty);

  if (!success) {
    return {error: true};
  }

  // Parse session_data using Claude Haiku
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Parse this data string into valid JSON, such that you can then efficiently extract key data from it. Only respond with the JSON, no other text: ${data.session_data}`,
      },
    ],
  });

  // Extract JSON from Haiku's response
  // The content will be in the first content block's value
  const parsed_data =
    message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    await db
      .update(SessionsTable)
      .set({
        name: data.name,
        type: data.type,
        date: data.date,
        session_data: data.session_data,
        parsed_data: parsed_data,
      })
      .where(eq(SessionsTable.session_id, sessionId));

    revalidatePath('/sessions');
    return undefined;
  } catch (error) {
    console.error('Error updating session:', error);
    return {error: true};
  }
}

/**
 * Fetches AI-enhanced session data by date range.
 * @param {string} startDate - The start date of the range (YYYY-MM-DD).
 * @param {string} endDate - The end date of the range (YYYY-MM-DD).
 * @returns {Promise<Session[]>} List of sessions within the date range.
 */
export async function getAISessionsByDate(date_range: {
  startDate: string;
  endDate: string;
}): Promise<AISession[]> {
  const {userId, redirectToSignIn} = auth();
  let sessions: AISession[] = [];

  if (userId === null) {
    redirectToSignIn();
    return sessions;
  }
  sessions = await db.query.SessionsTable.findMany({
    where: ({date, user_id}, {and, gte, lte, eq}) =>
      and(
        eq(user_id, userId),
        gte(date, new Date(date_range.startDate)),
        lte(date, new Date(date_range.endDate)),
      ),
    orderBy: ({date}, {desc}) => desc(date),
    columns: {
      user_id: false, //Exclude user_id from results
      session_id: false,
      session_data: false,
    },
  });

  return sessions;
}

/**
 * Fetches AI-enhanced session data based on keywords.
 * @param {string[]} keywords - List of keywords to filter sessions.
 * @returns {Promise<Session[]>} List of sessions matching the keywords.
 */
export async function getAISessionsbyKeyword(
  keywords: string[],
): Promise<AISession[]> {
  const {userId, redirectToSignIn} = auth();
  let sessions: AISession[] = [];

  if (userId === null) {
    redirectToSignIn();
    return sessions;
  }
  sessions = await db.query.SessionsTable.findMany({
    where: ({name, type, parsed_data, user_id}, {and, or, like, eq}) =>
      and(
        eq(user_id, userId),
        or(
          ...keywords.flatMap(keyword => [
            like(name, `%${keyword}%`),
            like(type, `%${keyword}%`),
            like(parsed_data, `%${keyword}%`),
          ]),
        ),
      ),
    orderBy: ({date}, {desc}) => desc(date),
    columns: {
      user_id: false,
      session_id: false,
      session_data: false,
    },
  });

  return sessions;
}
/**
 * Retrieves AI-enhanced sessions using date and/or keyword filters.
 * @param {Object} filters - Filters to apply.
 * @param {string[]} filters.keywords - Keywords to filter sessions.
 * @param {string} filters.startDate - Start date of the range (optional).
 * @param {string} filters.endDate - End date of the range (optional).
 * @returns {Promise<Session[]>} Filtered list of sessions.
 */
export async function getAISessions(
  AIparams: AISessionParameters,
): Promise<AISession[]> {
  const {userId, redirectToSignIn} = auth();
  let sessions: AISession[] = [];

  if (userId === null) {
    redirectToSignIn();
    return sessions;
  }

  sessions = await db.query.SessionsTable.findMany({
    where: (
      {name, type, parsed_data, user_id, date},
      {and, or, like, eq, gte, lte, sql},
    ) => {
      const conditions: SQL<unknown>[] = [eq(user_id, userId)];

      // Add keyword conditions only if keywords array exists and is not empty
      if (AIparams.keywords?.length) {
        const keywordConditions = AIparams.keywords.flatMap(keyword => [
          like(name, `%${keyword}%`),
          like(type, `%${keyword}%`),
          // Cast JSONB to text before using LIKE
          sql`CAST(${parsed_data} AS TEXT) LIKE ${`%${keyword}%`}`,
        ]);

        if (keywordConditions.length > 0) {
          const orCondition = or(...keywordConditions);
          if (orCondition) {
            conditions.push(orCondition);
          }
        }
      }

      // Add date range conditions if provided
      if (AIparams.dateRange) {
        conditions.push(
          sql`${date} >= ${new Date(AIparams.dateRange.startDate).toISOString().split('T')[0]}`,
          sql`${date} < ${new Date(AIparams.dateRange.endDate).toISOString().split('T')[0]}::date + interval '1 day'`,
        );
      }

      // Filter out any undefined values and spread the array
      return and(...conditions);
    },
    orderBy: ({date}, {desc}) => desc(date),
    columns: {
      user_id: false,
      session_id: false,
      session_data: false,
    },
  });

  return sessions;
}

/**
 * Extracts AI parameters (keywords, dates) from a user query.
 * @param {string} query - The user-provided query.
 * @returns {Promise<{keywords: string[]; startDate?: string; endDate?: string}>} Extracted parameters.
 */
export async function getAIParameters(
  query: string,
): Promise<AISessionParameters> {
  // Get current date
  const currentDate = new Date().toDateString();
  console.log(currentDate);

  // get time range using Claude Haiku
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Keep in mind that today's date is ${currentDate}.
                  You are an expert at analyzing session data. Your response is 
                  going to be fed directly into this function, make sure to include 
                  the parameters in your response:
                  
                  getAISessions()
                  parameters: 
                    keywords : set of keywords, string[]
                    dateRange : {
                      startDate: string in the form "2024-10-30",
                      endDate: string in the form "2024-10-30"
                    }
                  description: 
                    Gets all sessions within the given date range that include
                    at least one of the keywords provided. If there are no keywords, 
                    gets all sessions in the date range. If there is no date range, 
                    gets all sessions that inclde at least one of the keywords.
  
                  Process:
                  0. If the query is off topic, meaning it is not a 
                     question about session history, make each 'keywords'
                     and 'dateRange' null.
                  1. Plan what data you need to answer the question.
                     Try to use the least data possible to answer
                     each question.
                  2. Request specific data using the available function
                  3. Analyze the data and provide a clear response
                  4. Do not include dates or date related words in the keywords
  
                  Format your response as JSON object with a 'parameters' key
                  and nothing else. Nothing before or after the JSON.                

                  This is the question: ${query}
                    `,
      },
    ],
  });
  console.log(typeof response);
  console.log(response);

  if (response.content[0].type === 'text') {
    const parsedText = JSON.parse(response.content[0].text); //object
    const responseText = JSON.stringify(parsedText);

    console.log(typeof responseText);
    console.log(`parsed: ${responseText}`);

    const reparsedText = JSON.parse(responseText);

    console.log(reparsedText.parameters.keywords ? 'defined' : 'null');
    console.log(reparsedText.parameters.dateRange ? 'defined' : 'null');
  }

  //extract function parameters from response
  const params: AISessionParameters = {
    keywords: undefined,
    dateRange: undefined,
  };

  params.keywords =
    response.content[0].type === 'text' &&
    JSON.parse(response.content[0].text).parameters.keywords
      ? JSON.parse(response.content[0].text).parameters.keywords
      : undefined;

  params.dateRange =
    response.content[0].type === 'text' &&
    JSON.parse(response.content[0].text).parameters.dateRange
      ? JSON.parse(response.content[0].text).parameters.dateRange
      : undefined;

  console.log(
    `Returning: ${params.keywords} ${params.dateRange?.startDate} ${params.dateRange?.endDate}`,
  );
  return params;
}

/**
 * Answers user questions using AI-parsed session data.
 * @param {string} question - The user-provided question.
 * @returns {Promise<string>} AI-generated answer to the question.
 */
export async function answerQuestion(query: string): Promise<string> {
  // Get current date
  const currentDate = new Date().toDateString();

  // get time range using Claude Haiku
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Keep in mind that today's date is ${currentDate}.
                  Analyze the following question and return a date range that 
                  defines the scope of the question. Express the answer as 
                  postgres date objects in the form '{ "startDate": "string", "endDate": "string" }'.
                  If no date is specified or you cannot get a date, use the range of year 1900 to today's date.
                  Return only this range in this JSON form and nothing else: ${query}.
                  `,
      },
    ],
  });

  const dateRange =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const {userId, redirectToSignIn} = auth();
  let sessions: AISession[] = [];

  if (userId === null) {
    redirectToSignIn();
    return 'redirected to Sign In';
  }

  console.log(`Returned date range: ${dateRange}`);
  // not completely parsed
  sessions = await getAISessionsByDate(JSON.parse(dateRange));
  // console.log(sessions);

  //analyze data and answer question
  // get time range using Claude Haiku
  const answer = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0,
    system: `You are an expert in this session history ${JSON.stringify(sessions)}. 
             
             Each session has a name, a date, a type and a parsed_data section. 
             The first 3 are straight forward, the parsed_data is a JSON verion of everything
             a user wanted to store for that session. 

             The prompt you are given is a question from a user about their data history.

             You must answer questions to the best of your 
             abilities using only this data. You are to give concise answers 
             whenever posible. If the question seems too 
             unrelated to the provided data, don't analyze it.
             If the question may be answered using visuals, explain which 
             visuals would best do the job and provide 
             the structured data necessary to create such visuals. 
             Be sure to include linebreaks and indentations in the analysis 
             response to create good looking answers.
             
             Always structure the resonse in a JSON object and include nothing else.
             Make sure to pay close attention to dates.
             Your analysis should be denoted by 'analysis:', and any visual 
             data should be denoted by 'visualData:'.

             For example, with a query like 
             'How much has my bench press improved in the last year?', 
             the output should be like:

             {
                "analysis": "You have improved by 200 lbs in the past year.",
                "visualData": [
                  {"date": "2024-01-01", "weight": 180},
                  {"date": "2024-02-01", "weight": 190},
                  {"date": "2024-03-01", "weight": 200}
                ]
              }
                `,
    messages: [
      {
        role: 'user',
        content: `${query}`,
      },
    ],
  });
  console.log('answer');
  console.log(answer);

  return answer.content[0].type === 'text'
    ? JSON.parse(answer.content[0].text).analysis
    : 'An answer could not be given';
}

/**
 * Splits query handling into parameter extraction and answering.
 * @param {string} question - The user-provided question.
 * @returns {Promise<string>} AI-generated answer to the question.
 */
export async function answerQuestionSplit(query: string): Promise<string> {
  // Get current date
  const currentDate = new Date().toDateString();
  console.log(currentDate);

  //get session params
  const params = await getAIParameters(query);
  console.log('Params');
  console.log(params);
  const {userId, redirectToSignIn} = auth();
  let sessions: AISession[] = [];

  if (userId === null) {
    redirectToSignIn();
    return 'redirected to Sign In';
  }
  console.log('getting sessions');

  sessions = await getAISessions(params);
  console.log(sessions);

  //analyze data and answer question
  // get time range using Claude Haiku
  const answer = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0,
    system: `You are an expert in this session history ${JSON.stringify(sessions)}. 
              The date is ${currentDate}.
              
              Each session has a name, a date, a type and a parsed_data section. 

              The date is in the form YYYY-MM-DD HH:MM:SS
              The parsed_data is a JSON version of everything a user wanted to 
              store for that session. 

              The prompt you are given is a question from a user about their data history.

              You must answer questions to the best of your 
              abilities using only this data. You are to give concise answers 
              whenever posible. If the question seems too 
              unrelated to the provided data, don't analyze it and return an error message in the 
              'analysis' JSON object.
              If the question may be answered using visuals, explain which 
              visuals would best do the job and provide 
              the structured data necessary to create such visuals. 
              Be sure to include linebreaks and indentations using '\\n' in the analysis 
              response to create good looking answers.
              
              Format your answers as JSON.
              Your analysis should be denoted by 'analysis:', and any visual 
              data should be denoted by 'visualData:'.

              For example, with a query like 
              'How much has my bench press improved in the last year?', 
              the output should be like:

              {
                "analysis": "You have improved by 200 lbs in the past year.",
                "visualData": [
                  {"date": "2024-01-01", "weight": 180},
                  {"date": "2024-02-01", "weight": 190},
                  {"date": "2024-03-01", "weight": 200}
                ]
              }

              Examples of valid responses, any other format is invalid:

              1. For a valid question with visualization:
              {
                "analysis": "Your bench press increased by 50 lbs over 3 months\\nStarting: 150 lbs\\nEnding: 200 lbs",
                "visualData": [
                  {"date": "2024-01-01", "weight": 150},
                  {"date": "2024-02-01", "weight": 175},
                  {"date": "2024-03-01", "weight": 200}
                ]
              }

              2. For a valid question without visualization:
              {
                "analysis": "Your last workout was on March 15, 2024",
                "visualData": null
              }

              3. For an unrelated or invalid question:
              {
                "analysis": "This question cannot be answered using the available session data. Please ask a question about your recorded sessions.",
                "visualData": null
              }

              Rules:
              1. ALWAYS return a JSON object with both "analysis" and "visualData" fields
              2. Use "\\n" for line breaks in analysis text
              3. Never leave analysis empty or undefined
              4. Set visualData to null if no visualization is needed
              5. For invalid/unrelated questions, use the exact error message shown in example 3
              6. NEVER respond with text outside of "analysis".
              7. Make sure to pay close attention to dates.
              8. If there is insufficient data, still try to respond with something and also note
                 that there is minimal data.

                `,
    messages: [
      {
        role: 'user',
        content: `${query}`,
      },
    ],
  });

  if (answer.content[0].type === 'text') {
    console.log(answer.content[0].text);
  } else {
    alert('This question can not be answered with the given data.');
    return 'An answer could not be given';
  }

  return answer.content[0].type === 'text' &&
    JSON.parse(answer.content[0].text).analysis
    ? JSON.parse(answer.content[0].text).analysis
    : 'An answer could not be given';
}
