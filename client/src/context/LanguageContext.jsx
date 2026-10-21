import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    issues: 'Community Issues',
    activities: 'Volunteer Activities',
    impact: 'Social Impact',
    reportIssue: 'Report an Issue',
    dashboard: 'Dashboard',
    login: 'Log In',
    register: 'Register',
    logout: 'Log Out',
    myReports: 'My Reports',
    volunteerWorkspace: 'Volunteer Desk',
    coordinatorPanel: 'Staff Portal',

    // Common Actions & Badges
    viewDetails: 'View Details',
    supportConfirm: 'Support / Confirm',
    shareWhatsApp: 'Share on WhatsApp',
    chronicHotspot: 'Chronic Hotspot',
    resolved: 'Resolved',
    inProgress: 'In Progress',
    approved: 'Approved',
    underReview: 'Under Review',
    submitted: 'Submitted',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Hero / Tagline
    tagline: 'Your Community. Your Voice. Together, We Create Change.',
    puneInitiative: 'Civic Action Initiative for Pune, Maharashtra',
    heroDesc: 'Bridging active citizen grievance reporting, grassroots volunteer mobilization, and Pune Municipal Corporation (PMC) escalation.'
  },
  mr: {
    // Navigation
    home: 'मुख्यपृष्ठ',
    issues: 'परिसरातील समस्या',
    activities: 'स्वयंसेवक उपक्रम',
    impact: 'सामाजिक प्रभाव',
    reportIssue: 'नागरी तक्रार नोंदवा',
    dashboard: 'डॅशबोर्ड',
    login: 'लॉग इन',
    register: 'नोंदणी करा',
    logout: 'बाहेर पडा',
    myReports: 'माझ्या तक्रारी',
    volunteerWorkspace: 'स्वयंसेवक कक्ष',
    coordinatorPanel: 'समन्वयक कक्ष',

    // Common Actions & Badges
    viewDetails: 'तपशील पहा',
    supportConfirm: 'पाठिंबा द्या',
    shareWhatsApp: 'व्हॉट्सॲपवर पाठवा',
    chronicHotspot: 'वारंवार कचरा होणारे ठिकाण',
    resolved: 'निकाली काढले',
    inProgress: 'काम सुरू आहे',
    approved: 'मंजूर',
    underReview: 'पुनरावलोकन सुरू',
    submitted: 'दाखल केले',
    critical: 'अतिगंभीर',
    high: 'गंभीर',
    medium: 'मध्यम',
    low: 'कमी',

    // Hero / Tagline
    tagline: 'तुमचा परिसर. तुमचा आवाज. एकत्र मिळून आणूया बदल.',
    puneInitiative: 'पुणे शहर नागरी सुधारणा उपक्रम (महाराष्ट्र)',
    heroDesc: 'नागरिकांच्या तक्रारी, स्थानिक स्वयंसेवकांची कृती आणि पुणे महानगरपालिका (PMC) यांच्यातील विश्वासाचा सेतू.'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sevadeep_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sevadeep_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
