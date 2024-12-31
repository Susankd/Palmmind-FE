
export default function AccountPage() {
  // Retrieve user details from localStorage
  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Account Details</h1>
        {parsedUser ? (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Name:</h2>
              <p className="text-gray-700">{parsedUser.name || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Email:</h2>
              <p className="text-gray-700">{parsedUser.email || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Role:</h2>
              <p className="text-gray-700 capitalize">{parsedUser.role || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-center">No user information found. Please log in.</p>
        )}
      </div>
    </div>
  );
}
