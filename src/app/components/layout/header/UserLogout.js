import { signOut } from 'next-auth/react';
import LogoutIcon from '../../../../../public/images/icons/logout.svg';
import useBootstrapTooltips from "@/app/hooks/useBootstrapTooltips";

const UserLogout = ({ profile }) => {

    useBootstrapTooltips();

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
            <button className="d-flex border-0 bg-transparent ms-lg-auto" onClick={handleLogout} data-bs-toggle="tooltip" data-bs-placement="right" title="Logout">
              <LogoutIcon className="icon" />
            </button>
          </div>
        )}
      </div>
  );
};

export default UserLogout;
