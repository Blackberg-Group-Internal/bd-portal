import { signOut } from 'next-auth/react';
import LogoutIcon from '../../../../../public/images/icons/logout.svg';

const UserLogout = ({ profile }) => {

  const handleLogout = () => {
    signOut();
  };

  return (
      <div className="menu-user-text mt-auto">
        {profile && (
          <div className="user-info d-flex text-figtree justify-content-center">
            <div className="flex-column d-none d-lg-flex">
              <span className="fw-bold">{profile.displayName}</span>
              <span className="email text-lowercase">{profile.mail}</span>
            </div>
            <button className="d-flex border-0 bg-transparent ms-lg-auto" onClick={handleLogout}>
              <LogoutIcon className="icon" />
            </button>
          </div>
        )}
      </div>
  );
};

export default UserLogout;
