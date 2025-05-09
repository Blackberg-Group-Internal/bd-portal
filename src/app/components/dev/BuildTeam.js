// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import OrgIcon from '../../../../public/images/icons/org.svg';

// const BuildTeam = ({ opportunityId, team = [] }) => {
//   const [employees, setEmployees] = useState([]);
//   const [selected, setSelected] = useState(team.map(m => m.employeeId));
//   const [loading, setLoading] = useState(false);
//   const [showTeamBuilder, setShowTeamBuilder] = useState(false);
//   const [teamSaved, setTeamSaved] = useState(team.length > 0);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       const res = await fetch('/api/employees');
//       const data = await res.json();
//       if (res.ok) {
//         setEmployees(data);
//       } else {
//         console.error('Failed to load employees:', data.error);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   const toggleEmployee = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
//     );
//   };

//   const saveTeam = async () => {
//     setLoading(true);
//     const res = await fetch('/api/opportunity/team', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ opportunityId, employeeIds: selected }),
//     });

//     const data = await res.json();
//     setLoading(false);
//     if (res.ok) {
//       setShowTeamBuilder(false);
//       setTeamSaved(true);
//     } else {
//       alert('Error: ' + data.error);
//     }
//   };

//   const selectedMembers = employees.filter(emp => selected.includes(emp.id));

//   return (
//     <div className="">
//       <button
//         className="btn btn--white btn--60 text-dark mb-2 w-100 pointer tile-animate d-flex justify-content-between py-2 align-items-center"
//         onClick={() => setShowTeamBuilder(!showTeamBuilder)}
//       >

//         <span>{teamSaved ? 'Update Team' : 'Build Team'}</span>

//         {!teamSaved && (
//         <div className="tool-icon rounded-3 me-1 align-self-start p-2">
//                   <OrgIcon className="ms-2" />
//                         </div>
//         )}
//         {teamSaved && (
//           <div className="d-flex align-items-center ms-2">
//             {selectedMembers.slice(0, 5).map((member, i) => (
//               <Image
//                 key={i}
//                 src={member.image || '/images/default-avatar.png'}
//                 alt={`${member.firstName} ${member.lastName}`}
//                 width={30}
//                 height={30}
//                 className="rounded-circle me-1"
//               />
//             ))}
//             {selectedMembers.length > 5 && (
//               <span className="badge bg-secondary">+{selectedMembers.length - 5}</span>
//             )}
//           </div>
//         )}
//       </button>

//       {showTeamBuilder && (
//         <div className="card p-3 border shadow-sm mb-3">
//           <h5 className="mb-3 d-none">Assign Team Members</h5>
//           <div className="mb-3" style={{height: '150px', overflow: 'scroll'}}>
//             {employees.map((emp) => (
//               <div className="form-check" key={emp.id}>
//                 <input
//                   className="form-check-input"
//                   type="checkbox"
//                   value={emp.id}
//                   id={`emp-${emp.id}`}
//                   checked={selected.includes(emp.id)}
//                   onChange={() => toggleEmployee(emp.id)}
//                 />
//                 <label className="form-check-label" htmlFor={`emp-${emp.id}`}>
//                   {emp.firstName} {emp.lastName}
//                 </label>
//               </div>
//             ))}
//           </div>
//           <div class="d-flex w-100 gap-3">
//           <button
//             className="btn btn-outline border w-50"
//             onClick={() => setShowTeamBuilder(false)}
//           >
//                Cancel
//             </button>
//           <button
//             className="btn btn-primary w-50"
//             onClick={saveTeam}
//             disabled={loading}
//           >
//                 {loading ? 'Saving...' : 'Save Team'}
//             </button>
//             </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BuildTeam;

import { useState, useEffect } from 'react';
import Image from 'next/image';
import OrgIcon from '../../../../public/images/icons/org.svg';

const BuildTeam = ({ opportunityId, lead = [], support = [], reviewer = [] }) => {
  const [employees, setEmployees] = useState([]);
  const [teamByRole, setTeamByRole] = useState({
    lead: [...lead],
    support: [...support],
    reviewer: [...reviewer],
  });
  const [loading, setLoading] = useState(false);
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const [teamSaved, setTeamSaved] = useState(
    lead.length > 0 || support.length > 0 || reviewer.length > 0
  );

  const roles = ['lead', 'support', 'reviewer'];

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok) setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const toggleEmployee = (role, id) => {
    setTeamByRole(prev => ({
      ...prev,
      [role]: prev[role].includes(id)
        ? prev[role].filter(eid => eid !== id)
        : [...prev[role], id],
    }));
  };

  const saveTeam = async () => {
    setLoading(true);
    const res = await fetch('/api/opportunity/build-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunityId,
        lead: teamByRole.lead.map(String),
        support: teamByRole.support.map(String),
        reviewer: teamByRole.reviewer.map(String),
      }),
    });

    setLoading(false);
    if (res.ok) {
      setShowTeamBuilder(false);
      setTeamSaved(true);
    } else {
      alert('Error saving team.');
    }
  };

  const selectedIds = [...teamByRole.lead, ...teamByRole.support, ...teamByRole.reviewer];
  const selectedMembers = employees.filter(emp => selectedIds.includes(String(emp.id)));

  return (
    <div className="">
      <button
        className="btn btn--white btn--60 text-dark mb-2 w-100 pointer tile-animate d-flex justify-content-between py-2 align-items-center"
        onClick={() => setShowTeamBuilder(!showTeamBuilder)}
      >
        <span>{teamSaved ? 'Update Team' : 'Build Team'}</span>
        {!teamSaved && (
          <div className="tool-icon rounded-3 me-1 align-self-start p-2">
            <OrgIcon className="ms-2" />
          </div>
        )}
        {teamSaved && (
          <div className="d-flex align-items-center ms-2">
            {selectedMembers.slice(0, 5).map((member, i) => (
            //   <Image
            //     key={i}
            //     src={member.image || '/images/default-avatar.png'}
            //     alt={`${member.firstName} ${member.lastName}`}
            //     width={30}
            //     height={30}
            //     className="rounded-circle me-1"
            //   />
            <div
                key={i}
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-1 p-3 fw-normal small"
                style={{ width: '30px', height: '30px'}}
                >
                {member.firstName?.charAt(0)}
                {member.lastName?.charAt(0)}
                </div>
            ))}
            {selectedMembers.length > 5 && (
              <span className="badge bg-secondary">+{selectedMembers.length - 5}</span>
            )}
          </div>
        )}
      </button>

      {showTeamBuilder && (
        <div className="card p-3 border shadow-sm mb-3">
          <h5 className="mb-3">Assign Team Members</h5>
          {roles.map(role => (
            <div key={role} className="mb-3">
              <strong className="text-uppercase small">{role}</strong>
              <div className="border rounded p-2" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                {employees.map(emp => (
                  <div className="form-check" key={`${role}-${emp.id}`}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`${role}-${emp.id}`}
                      checked={teamByRole[role].includes(String(emp.id))}
                      onChange={() => toggleEmployee(role, String(emp.id))}
                    />
                    <label className="form-check-label" htmlFor={`${role}-${emp.id}`}>
                      {emp.firstName} {emp.lastName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="d-flex w-100 gap-3">
            <button
              className="btn btn-outline border w-50"
              onClick={() => setShowTeamBuilder(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary w-50"
              onClick={saveTeam}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Team'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildTeam;
