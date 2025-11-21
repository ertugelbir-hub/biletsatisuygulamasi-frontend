import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import UserHistoryModal from './UserHistoryModal';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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
            <th className="text-end">İşlemler</th>
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
              <td className="text-end">{/* GEÇMİŞ BUTONU */}
                <button 
                  className="btn btn-sm btn-outline-info"
                  onClick={() => setSelectedUser(u.username)}>
                  📜 Geçmiş
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* MODAL: Eğer bir kullanıcı seçildiyse göster */}
      {selectedUser && (
        <UserHistoryModal 
          username={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}

export default UserManager;