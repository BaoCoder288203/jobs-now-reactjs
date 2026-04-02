import React from 'react';
import {
  type CVTemplateProps,
  normalizeText,
  getInitials,
  htmlToPlainText,
  toBulletLines,
  parseCertificate,
  toTimeline,
  isMeaningfulCompany,
  type CertificateLike
} from './common';

export function AutomotiveTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const sectionHeaderStyle = {
    fontSize: '13pt',
    fontWeight: 700,
    color: palette.accent,
    textTransform: 'uppercase' as const,
    borderBottom: `2px solid ${palette.accent}`,
    paddingBottom: '4px',
    marginBottom: '12px',
    marginTop: '0px'
  };

  const displayName = data.fullName?.trim() || data.headline || 'Curriculum Vitae';
  const displayTitle = data.title?.trim() || (data.fullName ? data.headline : '');
  const summaryText = htmlToPlainText(data.summary);
  const contactParts = [data.email, data.phone, data.address].filter(
    (value): value is string => Boolean(value && value.trim())
  );
  const uniqueSkills = (data.skills ?? []).filter((skill, index, list) => {
    const normalizedName = normalizeText(skill.name).toLowerCase();
    if (!normalizedName) return false;
    return list.findIndex((item) => normalizeText(item.name).toLowerCase() === normalizedName) === index;
  });

  const renderExperience = () => (
    data.work_experiences && data.work_experiences.length > 0 ? (
      <div style={{ marginBottom: '20px' }}>
        <h2 style={sectionHeaderStyle}>{l.experience}</h2>
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '14px', borderLeft: `2px solid ${palette.chipBorder}`, paddingLeft: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '11pt', color: palette.title }}>{normalizeText(exp.position)}</span>
                {isMeaningfulCompany(exp.company) && (
                  <span style={{ color: palette.accent, fontWeight: 600 }}> | {exp.company}</span>
                )}
              </div>
              <span style={{ fontSize: '9.5pt', color: palette.muted, whiteSpace: 'nowrap', backgroundColor: palette.chipBg, padding: '2px 8px', borderRadius: '4px' }}>
                {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
              </span>
            </div>
            {normalizeText(htmlToPlainText(exp.description)) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word' }}>
                {toBulletLines(exp.description).map((line, j) => (
                  <li key={j} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null
  );

  const renderEducation = () => (
    data.educations && data.educations.length > 0 ? (
      <div style={{ marginBottom: '20px' }}>
        <h2 style={sectionHeaderStyle}>{l.education}</h2>
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontWeight: 700, color: palette.title }}>{normalizeText(edu.school)}</span>
                {normalizeText(edu.degree) && <span style={{ color: palette.muted }}> — {edu.degree}</span>}
                {normalizeText(edu.major) && <span style={{ color: palette.accent, fontWeight: 600 }}> ({edu.major})</span>}
              </div>
              <span style={{ fontSize: '9pt', color: palette.muted, backgroundColor: palette.chipBg, padding: '2px 8px', borderRadius: '4px' }}>
                {toTimeline(edu.duration, edu.start_date, edu.end_date, l.present)}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const renderProjects = () => (
    data.projects && data.projects.length > 0 ? (
      <div style={{ marginBottom: '20px' }}>
        <h2 style={sectionHeaderStyle}>{l.projects}</h2>
        {data.projects.map((prj, i) => (
          <div key={i} style={{ marginBottom: '14px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{ fontWeight: 700, color: palette.accent }}>{normalizeText(prj.name)}</span>
                {normalizeText(prj.duration) && (
                <span style={{ fontSize: '9pt', color: palette.muted }}>{prj.duration}</span>
                )}
            </div>
            {normalizeText(htmlToPlainText(prj.description)) && (
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word' }}>
                {toBulletLines(prj.description).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            )}
            {prj.technologies && prj.technologies.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {prj.technologies.map((tech, idx) => (
                    <span key={idx} style={{fontSize: '8.5pt', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px'}}>{tech}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null
  );

  const renderCertificates = () => (
    data.certificates && data.certificates.length > 0 ? (
      <div style={{ marginBottom: '20px' }}>
        <h2 style={sectionHeaderStyle}>{l.certificates}</h2>
        <ul style={{ margin: 0, paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word' }}>
          {data.certificates.map((cert, i) => (
            <li key={i} style={{ marginBottom: '10px' }}>
              {(() => {
                const parsed = parseCertificate(cert as CertificateLike);
                const issuerText = parsed.issuer.replace(/\s+—\s+/g, '\n');
                const issuerLines = toBulletLines(issuerText);
                const resolvedIssuerLines = issuerLines.length > 0
                  ? issuerLines
                  : (parsed.issuer ? [parsed.issuer] : []);

                return (
                  <React.Fragment>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontWeight: 600, color: palette.title, wordBreak: 'break-word' }}>{parsed.name}</span>
                      {parsed.issueDate && (
                        <span style={{ fontSize: '9pt', color: palette.muted, whiteSpace: 'nowrap' }}>{parsed.issueDate}</span>
                      )}
                    </div>
                    {resolvedIssuerLines.length > 0 && (
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', lineHeight: '1.5' }}>
                        {resolvedIssuerLines.map((line, lineIndex) => (
                          <li key={lineIndex} style={{ marginBottom: '2px' }}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </React.Fragment>
                );
              })()}
            </li>
          ))}
        </ul>
      </div>
    ) : null
  );

  const renderLanguages = () => (
    data.languages && data.languages.length > 0 ? (
      <div style={{ marginBottom: '20px' }}>
         <h2 style={sectionHeaderStyle}>{l.languages}</h2>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: palette.text }}>
            {data.languages.map((lang, i) => {
              const name = typeof lang === 'string' ? lang : (lang as any).name ?? '';
              const prof = typeof lang !== 'string' ? (lang as any).proficiency : '';
              return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '4px' }}>
                    <span style={{fontWeight: 600}}>{name}</span>
                    {prof && <span style={{color: palette.muted}}>{prof}</span>}
              </div>
              );
            })}
        </div>
      </div>
    ) : null
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '297mm', backgroundColor: '#ffffff' }}>
      {/* Top Header - Stretching across */}
      <header
        style={{
          background: `linear-gradient(135deg, ${palette.sidebarBg} 0%, ${palette.chipBg} 100%)`,
          padding: '12mm 15mm',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          borderBottom: `4px solid ${palette.accent}`
        }}
      >
        <div
          style={{
            height: '100px',
            width: '100px',
            flexShrink: 0,
            borderRadius: '12px',
            border: `3px solid #ffffff`,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
            background: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.accent,
            fontWeight: 700,
            fontSize: '24px',
          }}
        >
          {data.avatarUrl && !avatarLoadFailed ? (
            <img
              src={data.avatarUrl}
              alt="Avatar"
              onError={() => setAvatarLoadFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            getInitials(displayName)
          )}
        </div>
        
        <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24pt', fontWeight: 800, color: palette.title, margin: 0, lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {displayName}
            </h1>
            {displayTitle && (
                <p style={{ margin: '6px 0 0 0', fontSize: '14pt', color: palette.accent, fontWeight: 600 }}>{displayTitle}</p>
            )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9.5pt', color: palette.text, textAlign: 'right', minWidth: '200px' }}>
            {contactParts.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <span>{item}</span>
                </div>
            ))}
        </div>
      </header>

      {/* Main Content - 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', padding: '12mm 15mm', flex: 1 }}>
        <main>
            {summaryText && (
            <div style={{ marginBottom: '24px' }}>
                <h2 style={sectionHeaderStyle}>Hồ sơ năng lực</h2>
                <p style={{ margin: 0, color: palette.text, lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify' }}>{summaryText}</p>
            </div>
            )}
            
            {renderExperience()}
            {renderEducation()}
            {renderProjects()}
        </main>
        
        <aside>
             {uniqueSkills.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                     <h2 style={sectionHeaderStyle}>{l.skills}</h2>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {uniqueSkills.map((skill, i) => (
                        <span
                            key={i}
                            style={{
                            backgroundColor: palette.chipBg,
                            color: palette.title,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '9.5pt',
                            fontWeight: 600,
                            border: `1px solid ${palette.chipBorder}`,
                            }}
                        >
                            {normalizeText(skill.name)}
                        </span>
                        ))}
                    </div>
                </div>
             )}
             
             {renderCertificates()}
             {renderLanguages()}
        </aside>
      </div>
    </div>
  );
}
