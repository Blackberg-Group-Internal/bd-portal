import React from 'react';

const ProposalOutlineList = ({ outlineJson }) => {
  if (!outlineJson) return <p>No proposal outline available.</p>;

  let parsed;
  try {
    const cleaned = outlineJson.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    try {
      parsed = JSON.parse(outlineJson); // fallback if not wrapped in code block
    } catch (err) {
      return <p>Invalid proposal outline format.</p>;
    }
  }

  // Normalize to array format
  const outlineData = parsed.proposalOutline || parsed.outline || [];

  const items = Array.isArray(outlineData)
    ? outlineData
    : Object.entries(outlineData).map(([key, value]) => ({
        section: key,
        title: value.title,
        description: value.description,
      }));  

  // Group into major sections and sub-sections
  const sections = {};

  items.forEach(({ section, title, description }) => {
    const label = section || title.split('.')[0];
    const isSub = section?.split('.')?.[1] !== '0' && section?.includes('.');
    const groupKey = label?.split('.')[0];

    if (!sections[groupKey]) {
      sections[groupKey] = { main: [], sub: [] };
    }

    if (isSub) {
      sections[groupKey].sub.push({ title, description });
    } else {
      sections[groupKey].main.push({ title, description });
    }
  });

  return (
    <ul className="list-group">
      {Object.keys(sections)
        .sort((a, b) => parseFloat(a) - parseFloat(b))
        .map((key) => (
          <li className="list-group-item" key={key}>
            {sections[key].main.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>: {item.description}
              </div>
            ))}
            {sections[key].sub.length > 0 && (
              <ul className="list-group list-group-flush ms-3 mt-2">
                {sections[key].sub.map((item) => (
                  <li className="list-group-item border-0 px-0" key={item.title}>
                    <strong>{item.title}</strong>: {item.description}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
    </ul>
  );
};

export default ProposalOutlineList;