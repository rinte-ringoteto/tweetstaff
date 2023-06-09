import React from 'react';

const SideBar: React.FC = () => {
  return (
    <aside className="bg-gray-200 w-64 p-4">
      <ul>
        <li>
          <a href="/">アカウント①</a>
        </li>
        {/* Add more sidebar items as needed */}
      </ul>
    </aside>
  );
};

export default SideBar;
