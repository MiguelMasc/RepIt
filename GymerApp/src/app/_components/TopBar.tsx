'use client';

import {ModeToggle} from '@/components/mode-toggle';
import {Button} from '@/components/ui/button';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from '@clerk/nextjs';
import {useRouter} from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Menu} from 'lucide-react';
import {useState} from 'react';

const Topbar = () => {
  const router = useRouter();
  const {isSignedIn} = useAuth();
  const [activeLink, setActiveLink] = useState<string | null>(null);

  const handleLogoClick = () => {
    if (isSignedIn) {
      router.push('/');
    } else {
      router.push('/');
    }
  };

  const handleLinkClick = (link: string) => {
    setActiveLink(null);
    if (isSignedIn) {
      switch (link) {
        case 'dashboard':
          router.push('/dashboard');
          break;
        // case 'facilities':
        //   router.push('/facilities');
        //   break;
        case 'sessions':
          router.push('/sessions');
          break;
        case 'goals':
          router.push('/goals');
          break;
        case 'supplements':
          router.push('/supplements');
          break;
        default:
          break;
      }
    } else {
      router.push('/');
    }
  };

  const links = ['dashboard', 'sessions', 'goals', 'supplements'];

  return (
    <>
      <header className="block z-50 sticky top-0 bg-neutral-100 dark:bg-gray-800 dark:text-white text-black p-6 border-b">
        <div className="relative flex justify-between items-center text-violet-600 px-2">
          <Button variant="logo" onClick={handleLogoClick}>
            RepIt
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden min-[720px]:flex items-center font-sans">
            {links.map(link => (
              <Button
                key={link}
                variant="link"
                onClick={() => handleLinkClick(link)}
                onMouseEnter={() => setActiveLink(link)}
                onMouseLeave={() => setActiveLink(null)}
                className={`relative group ${
                  activeLink === link ? 'text-violet-600' : ''
                }`}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-1 bg-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out ${
                    activeLink === link ? 'scale-x-100' : ''
                  }`}
                />
              </Button>
            ))}
          </div>

          {/* Navigation and User Actions */}
          <div className="flex items-center justify-end w-full">
            {/* Mobile View */}
            <div className="min-[720px]:hidden flex gap-3 px-4 items-center">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <Menu />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="font-sans bg-neutral-100 dark:bg-gray-800 dark:text-white text-black"
                >
                  <DropdownMenuGroup>
                    {[...links].map(link => (
                      <DropdownMenuItem key={link} className="">
                        <Button
                          variant="link"
                          onClick={() => handleLinkClick(link)}
                          className="w-full text-left group relative"
                        >
                          {link.charAt(0).toUpperCase() + link.slice(1)}
                          <span className="absolute left-0 right-0 bottom-0 h-1 bg-violet-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup className="flex flex-row justify-between px-1 items-center">
                    <DropdownMenuItem>
                      <SignedIn>
                        <UserButton />
                      </SignedIn>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="bg-violet-600 px-4 py-2 rounded-lg text-white">
                            Sign In
                          </button>
                        </SignInButton>
                      </SignedOut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={e => e.preventDefault()}>
                      <ModeToggle />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop View */}
            <div className="hidden min-[720px]:flex items-center">
              <div className="px-3 mt-1">
                <SignedIn>
                  <UserButton />
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-violet-600 px-4 py-2 rounded-md text-white">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
              <div>
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Topbar;
