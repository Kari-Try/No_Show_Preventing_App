import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [gradeCounts, setGradeCounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, ms, gc] = await Promise.all([
          api.get('/api/admin/overview'),
          api.get('/api/admin/monthly-stats'),
          api.get('/api/admin/grade-counts')
        ]);
        if (ov.data.success) {
          const d = ov.data.data || {};
          setOverview({
            totalUsers: d.total_users ?? d.totalUsers ?? 0,
            totalOwners: d.total_owners ?? d.totalOwners ?? 0,
            totalCustomers: d.total_customers ?? d.totalCustomers ?? 0,
            totalVenues: d.total_venues ?? d.totalVenues ?? 0,
            reservationsThisMonth: d.reservations_this_month ?? d.reservationsThisMonth ?? 0,
            noshowsThisMonth: d.noshows_this_month ?? d.noshowsThisMonth ?? 0,
          });
        }
        if (ms.data.success) setMonthly(ms.data.data || []);
        if (gc.data.success) setGradeCounts(gc.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || '관리자 통계를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    fetchUsers(page, roleFilter, gradeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, gradeFilter]);

    const fetchUsers = async (pageNum, role, grade) => {
      try {
        const res = await api.get('/api/admin/users', {
          params: {
            page: pageNum,
            size: 20,
          role: role || undefined,
          grade: grade || undefined
        }
      });
      if (res.data.success) {
        setUsers(res.data.data || []);
        const pg = res.data.pagination || {};
        setPage(pg.page || pageNum);
        setTotalPages(pg.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '사용자 목록을 불러오지 못했습니다.');
    }
  };

  const number = (v) => (v ?? 0).toLocaleString();
  const uniqueRoles = (roles) => Array.from(new Set(roles || []));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        ) : (
          <>
            {overview && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="전체 회원" value={number(overview.totalUsers)} />
                <StatCard title="사장" value={number(overview.totalOwners)} />
                <StatCard title="고객" value={number(overview.totalCustomers)} />
                <StatCard title="업장" value={number(overview.totalVenues)} />
                <StatCard title="이번 달 예약" value={number(overview.reservationsThisMonth)} />
                <StatCard title="이번 달 노쇼" value={number(overview.noshowsThisMonth)} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-3">월별 예약 통계</h2>
                {monthly.length === 0 ? (
                  <p className="text-gray-500 text-sm">데이터가 없습니다.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-2 text-left">월</th>
                          <th className="py-2 px-2 text-right">총 예약</th>
                          <th className="py-2 px-2 text-right">완료</th>
                          <th className="py-2 px-2 text-right">취소</th>
                          <th className="py-2 px-2 text-right">노쇼</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthly.map((m) => (
                          <tr key={m.ym} className="border-b last:border-0">
                            <td className="py-2 px-2">{m.ym}</td>
                            <td className="py-2 px-2 text-right">{number(m.totalResv ?? m.total_resv)}</td>
                            <td className="py-2 px-2 text-right">{number(m.completedCnt ?? m.completed_cnt)}</td>
                            <td className="py-2 px-2 text-right">{number(m.canceledCnt ?? m.canceled_cnt)}</td>
                            <td className="py-2 px-2 text-right text-red-600">{number(m.noshowCnt ?? m.noshow_cnt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-3">등급별 회원 수</h2>
                {gradeCounts.length === 0 ? (
                  <p className="text-gray-500 text-sm">데이터가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {gradeCounts.map((g) => (
                      <div key={g.gradeName || g.grade_name} className="flex justify-between text-sm border-b last:border-0 pb-1">
                        <span>{g.gradeName || g.grade_name}</span>
                        <span className="font-semibold">{number(g.usersInGrade ?? g.users_in_grade)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">사용자 목록</h2>
                <div className="flex space-x-2 text-sm">
                  <select
                    value={roleFilter}
                    onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">전체 역할</option>
                    <option value="admin">관리자</option>
                    <option value="owner">사장</option>
                    <option value="customer">고객</option>
                  </select>
                  <select
                    value={gradeFilter}
                    onChange={(e) => { setPage(1); setGradeFilter(e.target.value); }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">전체 등급</option>
                    <option value="ELITE">ELITE</option>
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="POOR">POOR</option>
                  </select>
                </div>
              </div>
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm">사용자 데이터가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-2 text-left">아이디</th>
                        <th className="py-2 px-2 text-left">이름</th>
                        <th className="py-2 px-2 text-left">이메일</th>
                        <th className="py-2 px-2 text-left">전화번호</th>
                        <th className="py-2 px-2 text-left">등급</th>
                        <th className="py-2 px-2 text-left">역할</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const roles = uniqueRoles(u.roles || []);
                        const userId = u.user_id || u.userId || '';
                        return (
                          <tr key={u.user_id || u.userId} className="border-b last:border-0">
                            <td className="py-2 px-2">
                              <div className="text-sm font-semibold">{u.username || '-'}</div>
                              <div className="text-xs text-gray-500">{userId}</div>
                            </td>
                            <td className="py-2 px-2">{u.real_name || u.realName || '-'}</td>
                            <td className="py-2 px-2">{u.email || '-'}</td>
                            <td className="py-2 px-2">{u.phone || '-'}</td>
                            <td className="py-2 px-2">{u.grade_name || u.gradeName || '-'}</td>
                            <td className="py-2 px-2">{roles.join(', ')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-3 text-sm">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  이전
                </button>
                <span className="px-2 py-1">{page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
