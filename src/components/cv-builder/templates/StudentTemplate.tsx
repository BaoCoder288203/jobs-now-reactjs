import {
  type CVTemplateProps,
  normalizeText,
  getInitials,
  htmlToPlainText,
  toBulletLines,
  parseCertificate,
  toTimeline,
  type CertificateLike,
} from './common';

export function StudentTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const getSkillLevelWidth = (level?: string) => {
    const normalized = (level ?? '').trim().toLowerCase();
    if (!normalized) return 62;

    if (['beginner', 'intern', 'fresher'].includes(normalized)) return 45;
    if (['intermediate', 'middle', 'junior'].includes(normalized)) return 68;
    if (['advanced', 'senior', 'lead', 'expert'].includes(normalized)) return 90;
    return 62;
  };

  const sectionHeaderStyle = {
    fontSize: '13pt',
    fontWeight: 800,
    color: palette.title,
    borderBottom: `2px solid ${palette.chipBorder}`,
    paddingBottom: '4px',
    marginBottom: '16px',
    marginTop: '0px',
    textTransform: 'uppercase' as const,
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

  const renderEducation = () => (
    data.educations && data.educations.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        <h2 style={sectionHeaderStyle}>{l.education}</h2>
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '16px', borderLeft: `3px solid ${palette.accent}`, paddingLeft: '12px' }}>
            <div style={{ fontWeight: 800, fontSize: '11pt', color: palette.title }}>{normalizeText(edu.school)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ color: palette.accent, fontWeight: 600 }}>{normalizeText(edu.major)} {normalizeText(edu.degree) && `(${normalizeText(edu.degree)})`}</span>
                <span style={{ fontSize: '9pt', color: palette.muted }}>
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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={sectionHeaderStyle}>{l.projects}</h2>
        {data.projects.map((prj, i) => (
          <div key={i} style={{ marginBottom: '16px', backgroundColor: palette.chipBg, padding: '12px', borderRadius: '8px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{ fontWeight: 800, fontSize: '10.5pt', color: palette.title }}>{normalizeText(prj.name)}</span>
                {normalizeText(prj.duration) && (
                  <span style={{ fontSize: '9pt', color: palette.muted, backgroundColor: '#fff', padding: '2px 8px', borderRadius: '12px' }}>{prj.duration}</span>
                )}
            </div>
            {normalizeText(htmlToPlainText(prj.description)) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word', textAlign: 'justify' }}>
                {toBulletLines(prj.description).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            )}
            {prj.technologies && prj.technologies.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                 {prj.technologies.map((tech, idx) => (
                    <span key={idx} style={{ fontSize: '8.5pt', fontWeight: 600, color: palette.accent, backgroundColor: '#ffffff', border: `1px solid ${palette.chipBorder}`, padding: '2px 8px', borderRadius: '4px' }}>
                        {tech}
                    </span>
                 ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null
  );

  const renderExperience = () => (
    data.work_experiences && data.work_experiences.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        <h2 style={sectionHeaderStyle}>{l.experience}</h2>
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '10.5pt', color: palette.title }}>{normalizeText(exp.position)}</span>
                <span style={{ fontSize: '9pt', color: palette.muted }}>
                    {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
                </span>
            </div>
            {normalizeText(exp.company) && (
                <div style={{ color: palette.muted, fontWeight: 500, fontSize: '10pt', marginTop: '2px' }}>{exp.company}</div>
            )}
            {normalizeText(htmlToPlainText(exp.description)) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word', textAlign: 'justify' }}>
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

  const renderCertificates = () => (
     data.certificates && data.certificates.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
            <h2 style={sectionHeaderStyle}>{l.certificates}</h2>
            <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.text }}>
                {data.certificates.map((cert, i) => {
                    const parsed = parseCertificate(cert as CertificateLike);
                    return (
                    <li key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ fontWeight: 700, color: palette.title, fontSize: '10pt' }}>{parsed.name}</div>
                        <div style={{ fontSize: '9.5pt', color: palette.muted, marginTop: '2px' }}>{parsed.issuer} {parsed.issueDate ? `- ${parsed.issueDate}` : ''}</div>
                    </li>
                    )
                })}
            </ul>
        </div>
     ) : null
  );

  const renderLanguages = () => (
     data.languages && data.languages.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
            <h2 style={sectionHeaderStyle}>{l.languages}</h2>
            <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.text }}>
                {data.languages.map((lang, i) => {
                    const name = typeof lang === 'string' ? lang : (lang as any).name ?? '';
                    const prof = typeof lang !== 'string' ? (lang as any).proficiency : '';
                    return (
            <li key={i} style={{ marginBottom: '10px', fontSize: '10pt', lineHeight: '1.45' }}>
              <div style={{ fontWeight: 600 }}>{name}</div>
              {prof && <div style={{ color: palette.muted, marginTop: '2px' }}>{prof}</div>}
                    </li>
                    );
                })}
            </ul>
        </div>
     ) : null
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '297mm' }}>
      {/* Top Header */}
      <header
        style={{
          padding: '16mm 16mm 10mm 16mm',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: `8px solid ${palette.chipBorder}`
        }}
      >
         <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              backgroundColor: palette.chipBg, 
              color: palette.accent,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '32px', 
              fontWeight: 700, 
              border: `4px solid ${palette.accentSoft}`,
              marginBottom: '16px',
              overflow: 'hidden'
          }}>
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
          
          <h1 style={{ fontSize: '26pt', fontWeight: 900, color: palette.title, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {displayName}
          </h1>
          {displayTitle && (
              <div style={{ fontSize: '13pt', color: palette.accent, fontWeight: 700, marginBottom: '16px' }}>
                  {displayTitle}
              </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', fontSize: '9.5pt', color: palette.muted, fontWeight: 500 }}>
             {contactParts.map((item, idx) => (
                <div key={idx}>
                    {item}
                </div>
             ))}
          </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', minHeight: '200px' }}>
          {/* Main Content (Left) */}
          <main style={{ padding: '12mm 16mm', borderRight: '1px solid #f1f5f9' }}>
               {summaryText && (
                  <div style={{ marginBottom: '24px' }}>
                      <h2 style={sectionHeaderStyle}>{l.summary}</h2>
                      <p style={{ margin: 0, color: palette.text, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify', fontSize: '10.5pt' }}>{summaryText}</p>
                  </div>
              )}
              
              {/* Prioritize Education and Projects for Students */}
              {renderEducation()}
              {renderProjects()}
              {renderExperience()}
          </main>
          
          {/* Sidebar (Right) */}
          <aside style={{ padding: '12mm 16mm', backgroundColor: '#fafaf9' }}>
               {uniqueSkills.length > 0 && (
                   <div style={{ marginBottom: '24px' }}>
                       <h2 style={sectionHeaderStyle}>{l.skills}</h2>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           {uniqueSkills.map((skill, i) => (
                              <div key={i}>
                                  <div style={{ fontSize: '9.5pt', fontWeight: 700, color: palette.title, marginBottom: '4px' }}>
                                      {normalizeText(skill.name)}
                                  </div>
                                    <div style={{ height: '6px', width: '100%', backgroundColor: palette.chipBorder, borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${getSkillLevelWidth(skill.level)}%`, backgroundColor: palette.accent }}></div>
                                  </div>
                              </div>
                           ))}
                       </div>
                   </div>
               )}

               {renderLanguages()}
               {renderCertificates()}
          </aside>
      </div>
    </div>
  );
}
