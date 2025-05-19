import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToNotes, Note } from '../services/noteService';
import { subscribeToQuestions, Question } from '../services/questionService';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlusCircle, StickyNote, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    const unsubscribeNotes = subscribeToNotes(user, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });
    
    const unsubscribeQuestions = subscribeToQuestions(user, (fetchedQuestions) => {
      setQuestions(fetchedQuestions);
    });
    
    return () => {
      unsubscribeNotes();
      unsubscribeQuestions();
    };
  }, [user]);
  
  const getRecentNotes = () => {
    return [...notes]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3);
  };
  
  const getRecentQuestions = () => {
    return [...questions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
  };
  
  const getTodaysDate = () => {
    return format(new Date(), 'EEEE, MMMM d, yyyy');
  };
  
  if (!user) return null;
  
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {user.displayName?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{getTodaysDate()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Notes Overview */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center">
              <StickyNote size={20} className="text-primary-600 mr-2" />
              <h2 className="text-xl font-bold">Notes</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/notes')}
            >
              Add Note
            </Button>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
              ) : getRecentNotes().length > 0 ? (
                getRecentNotes().map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => navigate('/notes')}
                  >
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {note.title || 'Untitled Note'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {note.content || 'No content'}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <StickyNote size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No notes yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle size={16} />}
                    onClick={() => navigate('/notes')}
                  >
                    Create Your First Note
                  </Button>
                </div>
              )}
              
              {notes.length > 3 && (
                <div className="text-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/notes')}
                  >
                    View All Notes ({notes.length})
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
        
        {/* Questions Overview */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center">
              <HelpCircle size={20} className="text-accent-500 mr-2" />
              <h2 className="text-xl font-bold">Questions for Charu</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/questions')}
            >
              Add Question
            </Button>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
              ) : getRecentQuestions().length > 0 ? (
                getRecentQuestions().map((question) => (
                  <div
                    key={question.id}
                    className="p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => navigate('/questions')}
                  >
                    <div className="flex items-start">
                      <div className={`h-5 w-5 rounded-full flex-shrink-0 mr-3 mt-0.5 ${
                        question.alreadyAsked 
                          ? 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400' 
                          : 'bg-accent-100 dark:bg-accent-900 text-accent-600 dark:text-accent-400'
                      }`}>
                        {question.alreadyAsked && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 p-1">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {question.text}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {format(new Date(question.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <HelpCircle size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No questions yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusCircle size={16} />}
                    onClick={() => navigate('/questions')}
                  >
                    Add Your First Question
                  </Button>
                </div>
              )}
              
              {questions.length > 3 && (
                <div className="text-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/questions')}
                  >
                    View All Questions ({questions.length})
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
          <CardBody>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mr-4">
                <StickyNote size={24} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {notes.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Notes
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800">
          <CardBody>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-accent-100 dark:bg-accent-800 flex items-center justify-center mr-4">
                <HelpCircle size={24} className="text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Questions
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800">
          <CardBody>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-secondary-600 dark:text-secondary-400">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {questions.filter(q => q.alreadyAsked).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Questions Asked
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <CardBody>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-gray-600 dark:text-gray-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {questions.filter(q => !q.alreadyAsked).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Pending Questions
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;