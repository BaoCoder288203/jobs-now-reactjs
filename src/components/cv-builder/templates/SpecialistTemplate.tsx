import {
  type CVTemplateProps,
  normalizeText,
  htmlToPlainText,
  toBulletLines,
  parseCertificate,
  toTimeline,
  isMeaningfulCompany,
  type CertificateLike
} from './common';

export function SpecialistTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const sectionHeaderStyle = {
    fontSize: '14pt',
    fontWeight: 800,
    color: palette.title,
    textTransform: 'uppercase' as const,
    borderBottom: `3px solid ${palette.chipBorder}`,
    paddingBottom: '4px',
    marginBottom: '16px',
    marginTop: '0px',
    display: 'inline-block'
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
      <div style={{ marginBottom: '32px' }}>
        <h2 style={sectionHeaderStyle}>{l.experience}</h2>
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '12pt', color: palette.title }}>{normalizeText(exp.position)}</div>
                {isMeaningfulCompany(exp.company) && (
                  <div style={{ color: palette.muted, fontWeight: 500, fontSize: '10.5pt', marginTop: '2px' }}>{exp.company}</div>
                )}
              </div>
              <div style={{ fontSize: '9.5pt', color: palette.accent, fontWeight: 700, backgroundColor: palette.accentSoft, padding: '4px 10px', borderRadius: '20px' }}>
                {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
              </div>
            </div>
            {normalizeText(htmlToPlainText(exp.description)) && (
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.7', wordBreak: 'break-word', textAlign: 'justify' }}>
                {toBulletLines(exp.description).map((line, j) => (
                  <li key={j} style={{ marginBottom: '6px' }}>{line}</li>
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
      <div style={{ marginBottom: '32px' }}>
        <h2 style={sectionHeaderStyle}>{l.education}</h2>
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '11pt', color: palette.title }}>{normalizeText(edu.school)}</span>
                {normalizeText(edu.degree) && <span style={{ color: palette.muted }}> | {edu.degree}</span>}
                {normalizeText(edu.major) && <span style={{ color: palette.text }}> - {edu.major}</span>}
              </div>
              <span style={{ fontSize: '9.5pt', color: palette.muted, fontWeight: 600 }}>
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
      <div style={{ marginBottom: '32px' }}>
        <h2 style={sectionHeaderStyle}>{l.projects}</h2>
        {data.projects.map((prj, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{ fontWeight: 800, fontSize: '11pt', color: palette.title }}>{normalizeText(prj.name)}</span>
                {normalizeText(prj.duration) && (
                  <span style={{ fontSize: '9.5pt', color: palette.muted, fontWeight: 600 }}>{prj.duration}</span>
                )}
            </div>
            {normalizeText(htmlToPlainText(prj.description)) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.7', wordBreak: 'break-word', textAlign: 'justify' }}>
                {toBulletLines(prj.description).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{line}</li>
                ))}
              </ul>
            )}
            {prj.technologies && prj.technologies.length > 0 && (
              <div style={{ marginTop: '8px', color: palette.muted, fontSize: '9.5pt' }}>
                <span style={{ fontWeight: 700, color: palette.title }}>{l.technology}:</span> {prj.technologies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null
  );

  const renderCertificatesAndLanguages = () => {
    return (
      <div style={{ display: 'flex', gap: '30px', marginBottom: '32px' }}>
         {data.certificates && data.certificates.length > 0 && (
            <div style={{ flex: 1 }}>
                <h2 style={sectionHeaderStyle}>{l.certificates}</h2>
                <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.text, lineHeight: '1.6' }}>
                    {data.certificates.map((cert, i) => {
                        const parsed = parseCertificate(cert as CertificateLike);
                        return (
                        <li key={i} style={{ marginBottom: '12px' }}>
                            <div style={{ fontWeight: 700, color: palette.title }}>{parsed.name}</div>
                            <div style={{ fontSize: '9.5pt', color: palette.muted }}>{parsed.issuer}</div>
                            {parsed.issueDate && <div style={{ fontSize: '9pt', color: palette.accent }}>{parsed.issueDate}</div>}
                        </li>
                        )
                    })}
                </ul>
            </div>
         )}
         
         {data.languages && data.languages.length > 0 && (
            <div style={{ width: '200px' }}>
                 <h2 style={sectionHeaderStyle}>{l.languages}</h2>
                 <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.text }}>
                    {data.languages.map((lang, i) => {
                        const name = typeof lang === 'string' ? lang : (lang as any).name ?? '';
                        const prof = typeof lang !== 'string' ? (lang as any).proficiency : '';
                        return (
                        <li key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{fontWeight: 600}}>{name}</span>
                            {prof && <span style={{color: palette.muted}}>{prof}</span>}
                        </li>
                        );
                    })}
                </ul>
            </div>
         )}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '297mm' }}>
      {/* Top Banner */}
      <header
        style={{
          backgroundColor: palette.accent,
          color: palette.accentSoft,
          padding: '16mm 16mm',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', width: '100%', gap: '24px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '32pt', fontWeight: 900, color: '#ffffff', margin: '0 0 4px 0', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    {displayName}
                </h1>
                {displayTitle && (
                    <div style={{ fontSize: '14pt', color: palette.chipBorder, fontWeight: 600, letterSpacing: '0.05em' }}>
                        {displayTitle}
                    </div>
                )}
            </div>
            
            {data.avatarUrl && !avatarLoadFailed && (
                 <img
                    src={data.avatarUrl}
                    alt="Avatar"
                    onError={() => setAvatarLoadFailed(true)}
                    style={{ width: '110px', height: '110px', borderRadius: '12px', objectFit: 'cover', border: `3px solid ${palette.chipBorder}`, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)' }}
                 />
            )}
        </div>
      </header>

      <div style={{ backgroundColor: palette.sidebarBg, padding: '12px 16mm', borderBottom: '1px solid #e2e8f0' }}>
         <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', fontSize: '9.5pt', color: palette.sidebarText, fontWeight: 500 }}>
             {contactParts.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item}
                </div>
             ))}
         </div>
      </div>

      <main style={{ padding: '14mm 16mm' }}>
        {summaryText && (
            <div style={{ marginBottom: '32px' }}>
                <h2 style={sectionHeaderStyle}>{l.summary}</h2>
                <p style={{ margin: 0, color: palette.text, lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify', fontSize: '11pt' }}>{summaryText}</p>
            </div>
        )}
        
        {uniqueSkills.length > 0 && (
             <div style={{ marginBottom: '32px' }}>
                 <h2 style={sectionHeaderStyle}>{l.skills}</h2>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                     {uniqueSkills.map((skill, i) => (
                        <span key={i} style={{ padding: '6px 14px', border: `2px solid ${palette.chipBg}`, borderRadius: '24px', fontSize: '10pt', fontWeight: 600, color: palette.title }}>
                            {normalizeText(skill.name)}
                        </span>
                     ))}
                 </div>
             </div>
        )}

        {renderExperience()}
        {renderEducation()}
        {renderProjects()}
        {renderCertificatesAndLanguages()}
      </main>
    </div>
  );
}
