import React, { useEffect, useState } from 'react';

function TestBackend() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch("http://localhost:8080/hello")
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Message from Backend:</h2>
      <p>{message}</p>
    </div>
  );
}

export default TestBackend;
