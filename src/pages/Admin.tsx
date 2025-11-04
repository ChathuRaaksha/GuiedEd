import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Edit, Trash2, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";

type UserType = 'students' | 'mentors' | 'facilitators';

interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  [key: string]: any;
}

const ITEMS_PER_PAGE = 10;

const Admin = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserType>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [mentors, setMentors] = useState<UserRecord[]>([]);
  const [facilitators, setFacilitators] = useState<UserRecord[]>([]);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UserRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserRecord>>({});

  useEffect(() => {
    if (profile?.role !== 'ADMIN') {
      toast.error("Access denied. Admin privileges required.");
      navigate('/');
      return;
    }
    loadAllData();
  }, [profile, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, mentorsRes, facilitatorsRes] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('mentors').select('*').order('created_at', { ascending: false }),
        supabase.from('facilitators').select('*').order('created_at', { ascending: false }),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (mentorsRes.error) throw mentorsRes.error;
      if (facilitatorsRes.error) throw facilitatorsRes.error;

      setStudents(studentsRes.data || []);
      setMentors(mentorsRes.data || []);
      setFacilitators(facilitatorsRes.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    const data = activeTab === 'students' ? students : 
                 activeTab === 'mentors' ? mentors : 
                 facilitators;
    
    const filtered = data.filter(record => {
      const searchLower = searchQuery.toLowerCase();
      return (
        record.first_name?.toLowerCase().includes(searchLower) ||
        record.last_name?.toLowerCase().includes(searchLower) ||
        record.email?.toLowerCase().includes(searchLower)
      );
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      data: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE),
      totalRecords: filtered.length,
    };
  };

  const handleEdit = (record: UserRecord) => {
    setSelectedRecord(record);
    setEditFormData({ ...record });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from(activeTab)
        .update(editFormData)
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast.success('Record updated successfully');
      setEditDialogOpen(false);
      await loadAllData();
    } catch (error: any) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    }
  };

  const handleDelete = (record: UserRecord) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast.success('Record deleted successfully');
      setDeleteDialogOpen(false);
      await loadAllData();
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const { data: currentData, totalPages, totalRecords } = getCurrentData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage all users and records</p>
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {totalRecords} {activeTab} found
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as UserType);
              setCurrentPage(1);
              setSearchQuery('');
            }}>
              <TabsList className="mb-6">
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="mentors">Mentors</TabsTrigger>
                <TabsTrigger value="facilitators">Facilitators</TabsTrigger>
              </TabsList>

              {['students', 'mentors', 'facilitators'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {record.first_name} {record.last_name}
                              </TableCell>
                              <TableCell>{record.email}</TableCell>
                              <TableCell>
                                {new Date(record.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(record)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(record)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Update the information for {selectedRecord?.first_name} {selectedRecord?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editFormData.first_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editFormData.last_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>

            {activeTab === 'students' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={editFormData.school || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_level">Education Level</Label>
                  <Input
                    id="education_level"
                    value={editFormData.education_level || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, education_level: e.target.value })}
                  />
                </div>
              </>
            )}

            {activeTab === 'mentors' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    value={editFormData.employer || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, employer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={editFormData.role || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  />
                </div>
              </>
            )}

            {activeTab === 'facilitators' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="org">Organization</Label>
                  <Input
                    id="org"
                    value={editFormData.org || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, org: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={editFormData.role || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editFormData.city || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={editFormData.postcode || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record for {selectedRecord?.first_name} {selectedRecord?.last_name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
