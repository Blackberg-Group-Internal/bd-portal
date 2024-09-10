export async function fetchEmployeeHygraph(firstName, lastName) {
    try {
      const response = await fetch('/api/hygraph/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch employee from Hygraph');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }
  