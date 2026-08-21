import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { AuthContext } from "../../context/AuthContextType"; // Adjust file path if needed

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch Supabase User, Role, and SignOut from Auth Context
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const role = auth?.role;
  const signOut = auth?.signOut;

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Functional Supabase Sign Out Handler
  const handleSignOut = async () => {
    closeDropdown();

    try {
      if (signOut) {
        await signOut();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      navigate("/signin", { replace: true });
    }
  };

  // Dynamic values extracted from Supabase
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const displayEmail = user?.email || "";
  const profileImage =
    user?.user_metadata?.avatar_url || "/images/user/owner.jpg";
  const displayRole = role ? role.toUpperCase() : "MEMBER";

  return (
    <div className="relative">
      {/* Main Trigger Button - Idinagdag ang dropdown-toggle class */}
      <button
        onClick={toggleDropdown}
        type="button"
        className="dropdown-toggle flex items-center gap-3 p-1.5 rounded-full md:rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="relative pointer-events-none">
          <img
            src={profileImage}
            alt={displayName}
            className="object-cover rounded-full h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700"
          />
          {/* Online Indicator Badge */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full dark:border-gray-900"></span>
        </div>

        {/* Dynamic Display Name */}
        <div className="hidden text-left md:block pointer-events-none">
          <span className="block font-semibold text-gray-800 text-theme-sm dark:text-gray-100">
            {displayName}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
            {role || "User"}
          </span>
        </div>

        {/* Arrow Chevron Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 dark:text-gray-400 pointer-events-none ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Enhanced Popover Dropdown Card */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-72 flex-col rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 dark:shadow-2xl"
      >
        {/* User Header Section */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <img
            src={profileImage}
            alt={displayName}
            className="object-cover rounded-full h-12 w-12 ring-2 ring-primary/30"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-gray-900 truncate text-theme-sm dark:text-white">
              {displayName}
            </span>
            <span className="text-xs text-gray-500 truncate dark:text-gray-400 mb-1.5">
              {displayEmail}
            </span>
            {/* Dynamic Role Badge */}
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md w-max dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50">
              {displayRole}
            </span>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <ul className="flex flex-col gap-1 py-3 border-b border-gray-100 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-xl transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white group"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Edit Profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-xl transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white group"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Account Settings
            </DropdownItem>
          </li>
        </ul>

        {/* Enhanced Sign Out Action Button */}
        <div className="pt-2">
          <DropdownItem
            tag="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 font-medium text-rose-600 rounded-xl hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors group"
          >
            <svg
              className="w-5 h-5 text-rose-500 group-hover:translate-x-0.5 transition-transform dark:text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}