import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Dashboard from './Dashboard';
import Students from './Students';
import Mentors from './Mentors';
import Allocations from './Allocations';
import OJTs from './OJTs';
import Tasks from './Tasks';
import Submissions from './Submissions';
import Credits from './Credits';
import Attendance from './Attendance';
import EvaluationTracker from './EvaluationTracker';
import { useMockData } from '../../hooks/useMockData';
import { apiListCohorts, apiListStudents } from '../../lib/api';
import { useEffect } from 'react';
import type { Cohort, Student, Profile } from '../../lib/types';

export default function AdminPanel({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const data = useMockData();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [apiStudents, setApiStudents] = useState<Student[]>([]);
  const [apiProfiles, setApiProfiles] = useState<Profile[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'allocations') {
      apiListCohorts().then(res => setCohorts(res)).catch(() => {});
    } else if (activeTab === 'students') {
      setStudentsLoading(true);
      apiListStudents()
        .then(res => {
          const studentList = res && res.data ? res.data : (Array.isArray(res) ? res : []);
          const mappedStudents: Student[] = studentList.map((s: any) => ({
            user_id: s.id,
            roll_number: s.rollNumber || s.roll_number || '-',
            batch_id: s.batch || null,
            semester_id: s.semester || null,
            track: s.track || null,
            ojt_id: s.ojt_id || null,
            project_id: s.project_id || null,
            mentor_id: s.mentor_id || null,
            viva1: null,
            viva2: null,
            viva3: null,
            ojt_marks: null,
            progress_status: 'IN_PROCESS'
          }));
          const mappedProfiles: Profile[] = studentList.map((s: any) => ({
            id: s.id,
            email: s.email || '',
            name: s.fullName || s.name || 'Unknown Student',
            role: 'STUDENT' as const,
            created_at: s.createdAt || ''
          }));
          setApiStudents(mappedStudents);
          setApiProfiles(mappedProfiles);
        })
        .catch(err => console.error('Failed to load students from API:', err))
        .finally(() => setStudentsLoading(false));
    }
  }, [activeTab]);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profiles={data.profiles}
            students={data.students}
            tasks={data.tasks}
            submissions={data.submissions}
            credits={data.credits}
            attendance={data.attendance}
            semesters={data.semesters}
            batches={data.batches}
          />
        );
      case 'students':
        if (studentsLoading) {
          return (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Loading students from backend...</p>
              </div>
            </div>
          );
        }
        return (
          <Students
            profiles={apiProfiles.length > 0 ? [...data.profiles.filter(p => p.role !== 'STUDENT'), ...apiProfiles] : data.profiles}
            students={apiStudents.length > 0 ? apiStudents : data.students}
            batches={data.batches}
            semesters={data.semesters}
            updateStudent={data.updateStudent}
            addStudentRecord={data.addStudentRecord}
            addStudentRecords={data.addStudentRecords}
            deleteProfile={data.deleteProfile}
          />
        );
      case 'mentors':
        return <Mentors profiles={data.profiles} addMentor={data.addMentor} addMentors={data.addMentors} deleteProfile={data.deleteProfile} updateProfile={data.updateProfile} />;
      case 'allocations':
        return <Allocations students={data.students} profiles={data.profiles} projects={data.projects} cohorts={cohorts} updateStudent={data.updateStudent} resolveStudentChangeRequest={data.resolveStudentChangeRequest} />;
      case 'ojts':
        return (
          <OJTs
            projects={data.projects}
            addProject={data.addProject}
            addProjects={data.addProjects}
            deleteProject={data.deleteProject}
            profiles={data.profiles}
            students={data.students}
            importOJTBatch={data.importOJTBatch}
          />
        );
      case 'tasks':
        return <Tasks tasks={data.tasks} profiles={data.profiles} students={data.students} addTask={data.addTask} deleteTask={data.deleteTask} />;
      case 'submissions':
        return <Submissions submissions={data.submissions} tasks={data.tasks} profiles={data.profiles} students={data.students} comments={data.comments} addComment={data.addComment} updateSubmissionStatus={data.updateSubmissionStatus} />;
      case 'credits':
        return <Credits credits={data.credits} creditRequests={data.creditRequests} profiles={data.profiles} students={data.students} addCredit={data.addCredit} approveCreditRequest={data.approveCreditRequest} />;
      case 'attendance':
        return <Attendance attendance={data.attendance} profiles={data.profiles} students={data.students} toggleAttendance={data.toggleAttendance} markAllAttendance={data.markAllAttendance} />;
      case 'evaluation':
        return <EvaluationTracker profiles={data.profiles} students={data.students} attendance={data.attendance} updateStudent={data.updateStudent} />;
      default:
        return (
          <Dashboard
            profiles={data.profiles}
            students={data.students}
            tasks={data.tasks}
            submissions={data.submissions}
            credits={data.credits}
            attendance={data.attendance}
            semesters={data.semesters}
            batches={data.batches}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar panel="admin" activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{renderTab()}</div>
      </main>
    </div>
  );
}
