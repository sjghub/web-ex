"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api-fetch";
import { useDebounce } from "@/lib/debounce";

const USERS_PER_PAGE = 10;
const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
  TEMPORARY: "bg-amber-100 text-amber-800",
} as const;

const STATUS_LABELS = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  TEMPORARY: "임시",
} as const;

type UserStatus = keyof typeof STATUS_COLORS;

interface User {
  userId: number;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsers: number;
}

interface PagedResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
}

const fetchUsers = async (
  page: number,
  status: string,
  sort: string,
  search: string,
): Promise<PagedResponse> => {
  const response = await fetchWithAuth(
    `/admin/users?page=${page}&size=${USERS_PER_PAGE}&status=${status}&sort=${sort}&search=${search}`,
  );
  const data = await response.json();
  return data.success
    ? data.response
    : { content: [], totalPages: 1, totalElements: 0 };
};

const fetchUserStats = async (): Promise<UserStats> => {
  const response = await fetchWithAuth("/admin/users/stats");
  const data = await response.json();
  return data.success
    ? data.response
    : {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsers: 0,
      };
};

const formatDate = (dateString: string): string => dateString.split("T")[0];

export default function AdminUsersPage() {
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("기본 정렬");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsers: 0,
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadData = async () => {
      const [pageData, statsData] = await Promise.all([
        fetchUsers(
          currentPage,
          selectedFilter,
          sortOrder,
          debouncedSearchQuery,
        ),
        fetchUserStats(),
      ]);
      setUsers(pageData.content);
      setTotalPages(pageData.totalPages);
      setStats(statsData);
    };
    loadData();
  }, [currentPage, selectedFilter, sortOrder, debouncedSearchQuery]);

  const paginatedUsers = users;

  const handleViewUserDetail = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailDialog(true);
  };

  const handleToggleUserStatus = (user: User) => {
    const statusCycle: UserStatus[] = ["ACTIVE", "INACTIVE", "TEMPORARY"];
    const currentIndex = statusCycle.indexOf(user.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === user.userId ? { ...u, status: nextStatus } : u,
      ),
    );
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  // 렌더링
  return (
    <>
      <main>
        <h1 className="text-3xl font-bold mb-4">사용자 관리</h1>
        <h2 className="text-gray-600 mb-4">페이득 사용자를 관리합니다.</h2>
        <div className="mb-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white">
              <CardContent className="px-6">
                <div className="flex flex-col">
                  <span className="text-base text-gray-500 mb-2">
                    총 사용자
                  </span>
                  <span className="text-3xl font-bold">
                    {stats.totalUsers.toLocaleString()}명
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    이번 달 신규 가입: {stats.newUsers}명
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="px-6">
                <div className="flex flex-col">
                  <span className="text-base text-gray-500 mb-2">
                    활성 사용자
                  </span>
                  <span className="text-3xl font-bold">
                    {stats.activeUsers.toLocaleString()}명
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    전체의{" "}
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="px-6">
                <div className="flex flex-col">
                  <span className="text-base text-gray-500 mb-2">
                    비활성 사용자
                  </span>
                  <span className="text-3xl font-bold">
                    {stats.inactiveUsers.toLocaleString()}명
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    전체의{" "}
                    {((stats.inactiveUsers / stats.totalUsers) * 100).toFixed(
                      1,
                    )}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 필터 탭 */}
          <div className="mb-6">
            <Tabs
              defaultValue="전체"
              onValueChange={(v) => {
                setSelectedFilter(v);
                setCurrentPage(1);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 max-w-md gap-x-2">
                <TabsTrigger
                  value="전체"
                  className="relative text-black bg-white border border-gray-300 py-2 px-8 data-[state=active]:bg-black data-[state=active]:text-white cursor-pointer"
                >
                  전체
                  <span className="ml-2 px-3 py-1 text-xs rounded-full bg-gray-700 text-white">
                    {stats.totalUsers.toLocaleString()}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="활성"
                  className="relative text-black bg-white border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white cursor-pointer"
                >
                  활성
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">
                    {stats.activeUsers.toLocaleString()}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="비활성"
                  className="relative text-black bg-white border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white cursor-pointer"
                >
                  비활성
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {stats.inactiveUsers.toLocaleString()}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="임시"
                  className="relative text-black bg-white border border-gray-300 data-[state=active]:bg-black data-[state=active]:text-white cursor-pointer"
                >
                  임시
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                    {(
                      stats.totalUsers -
                      stats.activeUsers -
                      stats.inactiveUsers
                    ).toLocaleString()}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 사용자 목록 */}
          <div className="bg-white rounded-md border shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">사용자 목록</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="사용자 검색..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[180px] cursor-pointer hover:bg-gray-100">
                    <SelectValue placeholder="정렬 방식" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem
                      value="기본 정렬"
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      기본 정렬
                    </SelectItem>
                    <SelectItem
                      value="이름순"
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      이름순
                    </SelectItem>
                    <SelectItem
                      value="가입일순"
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      가입일순
                    </SelectItem>
                    <SelectItem
                      value="상태순"
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      상태순
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="px-6 py-3 font-medium w-[80px]">ID</th>
                    <th className="px-6 py-3 font-medium w-[120px]">이름</th>
                    <th className="px-6 py-3 font-medium w-[200px]">이메일</th>
                    <th className="px-6 py-3 font-medium text-center w-[100px]">
                      상태
                    </th>
                    <th className="px-6 py-3 font-medium w-[150px]">가입일</th>
                    <th className="px-6 py-3 font-medium text-center w-[80px]">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => (
                    <tr
                      key={`user-${user.userId || index}`}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 w-[80px] truncate">
                        {user.userId}
                      </td>
                      <td className="px-6 py-4 w-[120px] truncate">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 w-[200px] truncate">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-center w-[100px]">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_COLORS[user.status]
                          }`}
                        >
                          {STATUS_LABELS[user.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-[150px] truncate">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center w-[80px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="sr-only">메뉴 열기</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem
                              onClick={() => handleViewUserDetail(user)}
                              className="hover:bg-gray-100 cursor-pointer"
                            >
                              상세 정보
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleToggleUserStatus(user)}
                            >
                              상태 변경
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 hover:bg-red-50 cursor-pointer"
                              onClick={() => handleDeleteUser(user)}
                            >
                              사용자 삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="p-4 flex items-center justify-center gap-2">
              <Button
                key="prev"
                variant="ghost"
                size="sm"
                disabled={currentPage === 1 || totalPages === 0}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={`page-${i + 1}`}
                  variant="ghost"
                  size="sm"
                  className={currentPage === i + 1 ? "bg-black text-white" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                key="next"
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* 사용자 상세 정보 다이얼로그 */}
      <Dialog
        open={showUserDetailDialog}
        onOpenChange={setShowUserDetailDialog}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>사용자 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{selectedUser.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">상태</p>
                  <p className="font-medium">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLORS[selectedUser.status]
                      }`}
                    >
                      {STATUS_LABELS[selectedUser.status]}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">가입일</p>
                  <p className="font-medium">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">최근 로그인</p>
                  <p className="font-medium">2024.05.03 14:23</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserDetailDialog(false)}
                  className="text-red-500"
                >
                  닫기
                </Button>
                <Button variant="ghost">사용자 수정</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 사용자 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>사용자 삭제</DialogTitle>
            <DialogDescription>
              정말로 {selectedUser?.name} 사용자를 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              취소
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="text-red-500"
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
