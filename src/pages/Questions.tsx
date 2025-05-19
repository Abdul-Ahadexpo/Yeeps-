import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToQuestions, 
  addQuestion, 
  updateQuestion, 
  deleteQuestion,
  markQuestionAsAsked,
  Question 
} from '../services/questionService';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle,
  XCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Questions: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'asked'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionNotes, setNewQuestionNotes] = useState('');
  
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToQuestions(user, (fetchedQuestions) => {
      setQuestions(fetchedQuestions);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  const filteredQuestions = () => {
    let filtered = [...questions];
    
    // Apply filters
    if (filter === 'pending') {
      filtered = filtered.filter(q => !q.alreadyAsked);
    } else if (filter === 'asked') {
      filtered = filtered.filter(q => q.alreadyAsked);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });
    
    return filtered;
  };
  
  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !user) return;
    
    const newQuestion: Omit<Question, 'id'> = {
      text: newQuestionText.trim(),
      alreadyAsked: false,
      notes: newQuestionNotes.trim() || undefined,
      createdAt: Date.now(),
    };
    
    addQuestion(user, newQuestion)
      .then(() => {
        setNewQuestionText('');
        setNewQuestionNotes('');
        setIsAdding(false);
        toast.success('Question added successfully');
      })
      .catch((error) => {
        console.error('Error adding question:', error);
        toast.error('Failed to add question');
      });
  };
  
  const handleUpdateQuestion = () => {
    if (!editingQuestion || !user) return;
    
    const updatedQuestion: Question = {
      ...editingQuestion,
      text: newQuestionText.trim(),
      notes: newQuestionNotes.trim() || undefined,
    };
    
    updateQuestion(user, updatedQuestion)
      .then(() => {
        setEditingQuestion(null);
        toast.success('Question updated successfully');
      })
      .catch((error) => {
        console.error('Error updating question:', error);
        toast.error('Failed to update question');
      });
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    if (!user) return;
    
    deleteQuestion(user, questionId)
      .then(() => {
        if (editingQuestion?.id === questionId) {
          setEditingQuestion(null);
        }
        toast.success('Question deleted');
      })
      .catch((error) => {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      });
  };
  
  const handleToggleAsked = (questionId: string, currentState: boolean) => {
    if (!user) return;
    
    markQuestionAsAsked(user, questionId, !currentState)
      .then(() => {
        toast.success(currentState ? 'Marked as not asked' : 'Marked as asked');
      })
      .catch((error) => {
        console.error('Error toggling question state:', error);
        toast.error('Failed to update question');
      });
  };
  
  const startEditing = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestionText(question.text);
    setNewQuestionNotes(question.notes || '');
  };
  
  const renderQuestionModal = () => {
    const isEditing = Boolean(editingQuestion);
    const isOpen = isAdding || isEditing;
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Question' : 'Add Question'}
            </h2>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingQuestion(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question
              </label>
              <textarea
                id="questionText"
                className="input min-h-[100px]"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="What would you like to ask Charu?"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes~
              </label>
              <textarea
                id="notes"
                className="input"
                rows={3}
                value={newQuestionNotes}
                onChange={(e) => setNewQuestionNotes(e.target.value)}
                placeholder="Any additional context or notes about this question"
              ></textarea>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setEditingQuestion(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleUpdateQuestion : handleAddQuestion}
              disabled={!newQuestionText.trim()}
            >
              {isEditing ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  if (!user) return null;
  
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions for Charu</h1>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setNewQuestionText('');
            setNewQuestionNotes('');
            setIsAdding(true);
          }}
        >
          New Question
        </Button>
      </div>
      
      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <Loader size="large" />
        </div>
      ) : (
        <>
          {/* Filters and Sorting */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === 'asked' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('asked')}
                >
                  Asked
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                rightIcon={sortOrder === 'newest' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              >
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
          </div>
          
          {questions.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Questions Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add your first question for Charu to get started.
              </p>
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => {
                  setNewQuestionText('');
                  setNewQuestionNotes('');
                  setIsAdding(true);
                }}
              >
                Add Your First Question
              </Button>
            </div>
          ) : filteredQuestions().length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No questions match your current filter. Try changing the filter or adding new questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions().map((question) => (
                <Card key={question.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md">
                  <CardBody>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <button
                          onClick={() => handleToggleAsked(question.id, question.alreadyAsked)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            question.alreadyAsked 
                              ? 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400' 
                              : 'bg-accent-100 dark:bg-accent-900 text-accent-600 dark:text-accent-400'
                          }`}
                          aria-label={question.alreadyAsked ? 'Mark as not asked' : 'Mark as asked'}
                        >
                          {question.alreadyAsked ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-medium text-lg ${
                              question.alreadyAsked 
                                ? 'text-gray-500 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {question.text}
                            </h3>
                            
                            {question.notes && (
                              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                                {question.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-4">
                            <button
                              onClick={() => startEditing(question)}
                              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                              aria-label="Edit question"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"
                              aria-label="Delete question"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>Created: {format(new Date(question.createdAt), 'MMM d, yyyy')}</span>
                          {question.alreadyAsked && question.askedAt && (
                            <span className="ml-4">
                              Asked: {format(new Date(question.askedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {renderQuestionModal()}
    </div>
  );
};

export default Questions;
