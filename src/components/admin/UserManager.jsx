import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';

function UserManager() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiClient.get("/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="table-responsive">
      <h4 className="text-warning mb-3">👥 Kayıtlı Üyeler</h4>
      <table className="table table-dark table-hover border-secondary">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı Adı</th>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>#{u.id}</td>
              <td className="fw-bold">{u.username}</td>
              <td>{u.email}</td>
              <td>
                <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManager;