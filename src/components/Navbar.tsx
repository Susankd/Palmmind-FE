import { Link, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { ArrowLeftEndOnRectangleIcon, ArrowLeftStartOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import NotificationIcon from "./NotificationIcon";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Project", href: "/project" },
  { name: "Task", href: "/task" },
  { name: "My Account", href: "/my-account" },
];

export default function Example() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const user = localStorage.getItem("user");
  const jsonUser = user ? JSON.parse(user || "") : null;

  const adminNavigation = jsonUser?.role === "superadmin"
    ? [...navigation, { name: "Invite User", href: "/invite-user" }]
    : navigation;

  const logoutUser = async () => {
    try {
      localStorage.clear();
      navigate("/login");
      toast.success("You have been logged out successfully.");
    } catch (error) {
      alert("Failed to logout. Please try again.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated])

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex justify-center items-center rounded-md p-2 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {isAuthenticated &&
                      adminNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={`${active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                } block px-4 py-2 text-sm`}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:block">
              <div className="flex space-x-4">
                {isAuthenticated &&
                  adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          {/* Notification & Logout */}
          <div className="absolute inset-y-0 right-0 flex items-center space-x-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isAuthenticated && <NotificationIcon />}
            <button
              type="button"
              className="rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:outline-none"
              onClick={() => (isAuthenticated ? logoutUser() : navigate("/login"))}
            >
              <span className="sr-only">Logout or Login</span>
              {isAuthenticated ? (
                <ArrowLeftStartOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <ArrowLeftEndOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
