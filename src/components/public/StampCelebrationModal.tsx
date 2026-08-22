import React from 'react';
import { Modal } from '../ui/Modal';
import { Mandal } from '../../types';
import { Award, Sparkles, CheckCircle2, Share2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface StampCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mandal: Mandal | null;
  collectedCount: number;
  isAllCompleted: boolean;
}

export const StampCelebrationModal: React.FC<StampCelebrationModalProps> = ({
  isOpen,
  onClose,
  mandal,
  collectedCount,
  isAllCompleted,
}) => {
  if (!mandal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center p-6 sm:p-8 bg-[#FDFCF9] rounded-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F27D26]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Stamp Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border-4 border-[#F27D26] flex items-center justify-center text-white shadow-xl mx-auto ring-8 ring-[#F27D26]/20">
            <Award className="w-12 h-12 text-[#F27D26]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Editorial Title */}
        <p className="editorial-tag text-[#F27D26] mb-1">
          {isAllCompleted ? 'Divine Mastery Achieved' : 'Digital Stamp Collected'}
        </p>

        <h3 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mb-2 leading-tight">
          {mandal.name}
        </h3>

        {mandal.marathiName && (
          <p className="text-sm font-semibold text-[#1A1A1A]/60 mb-4">
            {mandal.marathiName}
          </p>
        )}

        <p className="text-sm text-[#1A1A1A]/80 leading-relaxed max-w-sm mx-auto mb-6">
          {isAllCompleted
            ? 'Congratulations! You have completed all 10 iconic mandals of GanPass 2026 Mumbai. Your spiritual pilgrimage is complete!'
            : `Your official digital darshan stamp has been added to your GanPass passport. You now have ${collectedCount} of 10 stamps!`}
        </p>

        {/* Progress display */}
        <div className="bg-[#1A1A1A] text-white p-5 rounded-2xl mb-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold mb-2">
            <span>Passport Progress</span>
            <span className="text-[#F27D26]">{collectedCount} / 10 Collected</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F27D26] transition-all duration-700"
              style={{ width: `${(collectedCount / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="editorial"
            size="md"
            pill
            onClick={onClose}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Continue Journey
          </Button>

          <Link to="/ganpass" onClick={onClose}>
            <Button
              variant="editorial-outline"
              size="md"
              pill
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Passport
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
