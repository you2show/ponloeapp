import React, { useState, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon, Location01Icon, BookOpen01Icon, Calendar01Icon, Image01Icon, Cancel01Icon, CheckmarkCircle01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import imageCompression from 'browser-image-compression';

interface VerificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationRequestModal: React.FC<VerificationRequestModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [role, setRole] = useState<'scholar' | 'creator'>('scholar');
  const [fullName, setFullName] = useState('');
  const [graduationPlace, setGraduationPlace] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    if (e.target.files && e.target.files.length > 0) {
      let file = e.target.files[0];
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        file = await imageCompression(file, options);
        if (type === 'photo') setPhotoFile(file);
        else setDocFile(file);
      } catch (err) {
        console.error('Error compressing image:', err);
        setError('មានបញ្ហាក្នុងការបង្រួមទំហំរូបភាព។');
      }
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/${path}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('verification_docs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('verification_docs')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!photoFile || !docFile) {
      setError('សូមបញ្ចូលរូបថត និងឯកសារបញ្ជាក់អត្តសញ្ញាណ។');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create bucket if it doesn't exist (handled by Supabase policies usually, but we assume it exists)
      const photoUrl = await uploadFile(photoFile, 'photo');
      const docUrl = await uploadFile(docFile, 'doc');

      const { error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          requested_role: role,
          full_name: fullName,
          graduation_place: graduationPlace,
          major: major,
          graduation_year: graduationYear,
          photo_url: photoUrl,
          document_url: docUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSuccess('សំណើរបស់អ្នកត្រូវបានបញ្ជូនដោយជោគជ័យ! យើងនឹងពិនិត្យមើលក្នុងពេលឆាប់ៗនេះ។');
      setTimeout(() => {
        onClose();
        setSuccess('');
        setFullName('');
        setGraduationPlace('');
        setMajor('');
        setGraduationYear('');
        setPhotoFile(null);
        setDocFile(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('Verification request error:', err);
      setError(err.message || 'មានបញ្ហាក្នុងការបញ្ជូនសំណើ។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ស្នើសុំការផ្ទៀងផ្ទាត់ (Verification)" size="md">
      <div className="flex flex-col h-full max-h-[80vh]">
        <div className="overflow-y-auto flex-grow custom-scrollbar -mx-4 px-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm mb-4 border border-emerald-100 flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-5 h-5" />
              {success}
            </div>
          )}

          <div className={`p-4 rounded-2xl mb-6 border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-emerald-50/50 border-emerald-100'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 shrink-0">
                <HugeiconsIcon icon={Shield01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  ទទួលបាន Badge "Verified"
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-600/80'}`}>
                  ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណជួយអោយគណនីរបស់អ្នកមានទំនុកចិត្តខ្ពស់។ សំណើរបស់អ្នកនឹងត្រូវបានពិនិត្យដោយ Admin។
                </p>
              </div>
            </div>
          </div>

          <form id="verification-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
            <div>
              <label className="block text-sm font-bold mb-2 opacity-70 text-gray-700 dark:text-slate-300">
                ជ្រើសរើសតួនាទី (Role)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('scholar')}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'scholar' 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                      : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-600')
                  }`}
                >
                  Scholar (គ្រូឧទ្ទេសក៍)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'creator' 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                      : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-600')
                  }`}
                >
                  Content Creator
                </button>
              </div>
            </div>

            <Input
              label="ឈ្មោះពេញ (Full Name)"
              placeholder="បញ្ចូលឈ្មោះពិតប្រាកដរបស់អ្នក"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-5 h-5" />}
            />

            <Input
              label="ទីកន្លែង ឬប្រទេសដែលបញ្ចប់ការសិក្សា"
              placeholder="ឧ. សាកលវិទ្យាល័យអាល់អះហ្សារ, អេហ្ស៊ីប"
              value={graduationPlace}
              onChange={(e) => setGraduationPlace(e.target.value)}
              required
              leftIcon={<HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-5 h-5" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="កម្រិត ឬជំនាញ"
                placeholder="ឧ. បរិញ្ញាបត្រ"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
                leftIcon={<HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5" />}
              />
              <Input
                label="ឆ្នាំដែលបញ្ចប់"
                placeholder="ឧ. 2020"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                required
                leftIcon={<HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-5 h-5" />}
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-sm font-bold opacity-70 text-gray-700 dark:text-slate-300">
                ឯកសារភ្ជាប់ (Attachments)
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Photo Upload */}
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  className={`relative h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${
                    photoFile 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50')
                  }`}
                >
                  {photoFile ? (
                    <>
                      <img src={URL.createObjectURL(photoFile)} alt="Photo" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <div className="relative z-10 flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold">បានជ្រើសរើសរូបថត</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Image01Icon} className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium text-center px-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        រូបថតផ្ទាល់ខ្លួន (Photo)
                      </span>
                    </>
                  )}
                  <input type="file" ref={photoInputRef} onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" className="hidden" />
                </div>

                {/* Document Upload */}
                <div 
                  onClick={() => docInputRef.current?.click()}
                  className={`relative h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${
                    docFile 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50')
                  }`}
                >
                  {docFile ? (
                    <>
                      <img src={URL.createObjectURL(docFile)} alt="Document" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <div className="relative z-10 flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold">បានជ្រើសរើសឯកសារ</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Image01Icon} className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium text-center px-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        ឯកសារបញ្ជាក់ (ID/Degree)
                      </span>
                    </>
                  )}
                  <input type="file" ref={docInputRef} onChange={(e) => handleFileChange(e, 'doc')} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            បោះបង់
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={loading || success !== ''}
          >
            បញ្ជូនសំណើ
          </Button>
        </div>
      </div>
    </Modal>
  );
};
