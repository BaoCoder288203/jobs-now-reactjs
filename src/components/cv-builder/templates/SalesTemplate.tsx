import {
  type CVTemplateProps,
  normalizeText,
  htmlToPlainText,
  toBulletLines,
  parseCertificate,
  toTimeline,
  type CertificateLike,
} from './common';

export function SalesTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const sectionHeaderStyle = {
    fontSize: '12pt',
    fontWeight: 800,
    color: '#ffffff',
    backgroundColor: palette.accent,
    padding: '6px 12px',
    marginBottom: '16px',
    marginTop: '0px',
    textTransform: 'uppercase' as const,
    display: 'inline-block',
  };

  const displayName = data.fullName?.trim() || data.headline || 'Curriculum Vitae';
  const displayTitle = data.title?.trim() || (data.fullName ? data.headline : '');
  const summaryText = htmlToPlainText(data.summary);
  const contactParts = [data.email, data.phone, data.address].filter(
    (value): value is string => Boolean(value && value.trim())
  );
  
  const hasLanguages = Boolean(data.languages && data.languages.length > 0);
  const uniqueSkills = (data.skills ?? []).filter((skill, index, list) => {
    const normalizedName = normalizeText(skill.name).toLowerCase();
    if (!normalizedName) return false;
    return list.findIndex((item) => normalizeText(item.name).toLowerCase() === normalizedName) === index;
  });

  const renderExperience = () => (
    data.work_experiences && data.work_experiences.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        <h2 style={sectionHeaderStyle}>{l.experience}</h2>
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${palette.chipBorder}`, paddingBottom: '4px', marginBottom: '8px' }}>
                <div>
                   <span style={{ fontWeight: 800, fontSize: '11pt', color: palette.title }}>{normalizeText(exp.position)}</span>
                   {normalizeText(exp.company) && (
                      <span style={{ color: palette.muted, fontWeight: 500, fontSize: '10.5pt' }}> | {exp.company}</span>
                   )}
                </div>
                <span style={{ fontSize: '9.5pt', color: palette.muted, fontWeight: 600 }}>
                    {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
                </span>
            </div>
            {normalizeText(htmlToPlainText(exp.description)) && (
              <ul style={{ margin: '0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word', textAlign: 'justify' }}>
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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={sectionHeaderStyle}>{l.education}</h2>
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '10.5pt', color: palette.title }}>{normalizeText(edu.school)}</span>
                <span style={{ fontSize: '9.5pt', color: palette.muted, fontWeight: 600 }}>
                    {toTimeline(edu.duration, edu.start_date, edu.end_date, l.present)}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px', fontSize: '10pt' }}>
                <span style={{ color: palette.text, fontWeight: 500 }}>{normalizeText(edu.major)} {normalizeText(edu.degree) && `(${normalizeText(edu.degree)})`}</span>
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
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${palette.chipBorder}`, paddingBottom: '4px', marginBottom: '8px'}}>
                <span style={{ fontWeight: 800, fontSize: '10.5pt', color: palette.title }}>{normalizeText(prj.name)}</span>
                {normalizeText(prj.duration) && (
                  <span style={{ fontSize: '9.5pt', color: palette.muted, fontWeight: 600 }}>{prj.duration}</span>
                )}
            </div>
            {normalizeText(htmlToPlainText(prj.description)) && (
              <ul style={{ margin: '0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word', textAlign: 'justify' }}>
                {toBulletLines(prj.description).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '297mm', padding: '16mm' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `4px solid ${palette.accent}`, paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '28pt', fontWeight: 900, color: palette.title, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                  {displayName}
              </h1>
              {displayTitle && (
                  <div style={{ fontSize: '14pt', color: palette.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {displayTitle}
                  </div>
              )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10pt', color: palette.muted, textAlign: 'right', fontWeight: 500, marginRight: '20px' }}>
             {contactParts.map((item, idx) => (
                <div key={idx}>{item}</div>
             ))}
          </div>
          {data.avatarUrl && !avatarLoadFailed && (
               <div style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                    <img
                        src={data.avatarUrl}
                        alt="Avatar"
                        onError={() => setAvatarLoadFailed(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
               </div>
          )}
      </header>

      {summaryText && (
          <div style={{ marginBottom: '24px' }}>
               <h2 style={sectionHeaderStyle}>{l.summary}</h2>
               <p style={{ margin: 0, color: palette.text, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify', fontSize: '10.5pt' }}>{summaryText}</p>
          </div>
      )}

      {/* Highlights structure - Sales focus */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px', backgroundColor: palette.chipBg, padding: '16px', border: `1px solid ${palette.chipBorder}` }}>
         <div>
             <h3 style={{ fontSize: '11pt', fontWeight: 800, color: palette.accent, marginBottom: '10px', marginTop: 0, textTransform: 'uppercase' }}>{l.skills}</h3>
             <ul style={{ margin: 0, paddingLeft: '18px', color: palette.title, fontWeight: 500, fontSize: '9.5pt', lineHeight: '1.6' }}>
                  {uniqueSkills.slice(0, 6).map((skill, i) => (
                      <li key={i}>{normalizeText(skill.name)}</li>
                  ))}
             </ul>
         </div>
         {hasLanguages && (
             <div>
                 <h3 style={{ fontSize: '11pt', fontWeight: 800, color: palette.accent, marginBottom: '10px', marginTop: 0, textTransform: 'uppercase' }}>{l.languages}</h3>
                 <ul style={{ margin: 0, paddingLeft: '18px', color: palette.title, fontWeight: 500, fontSize: '9.5pt', lineHeight: '1.6' }}>
                      {data.languages!.slice(0, 4).map((lang, i) => {
                          const name = typeof lang === 'string' ? lang : (lang as any).name ?? '';
                          const prof = typeof lang !== 'string' ? (lang as any).proficiency : '';
                          return (
                          <li key={i}>
                              {name} {prof && <span style={{color: palette.muted, fontWeight: 400}}>- {prof}</span>}
                          </li>
                          );
                      })}
                 </ul>
             </div>
         )}
      </div>

      {renderExperience()}
      {renderProjects()}
      
      <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: 1 }}>{renderEducation()}</div>
          {data.certificates && data.certificates.length > 0 && (
              <div style={{ flex: 1 }}>
                  <h2 style={sectionHeaderStyle}>{l.certificates}</h2>
                  <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.text }}>
                      {data.certificates.map((cert, i) => {
                          const parsed = parseCertificate(cert as CertificateLike);
                          return (
                          <li key={i} style={{ marginBottom: '10px' }}>
                              <div style={{ fontWeight: 700, color: palette.title, fontSize: '10pt' }}>{parsed.name}</div>
                              <div style={{ fontSize: '9.5pt', color: palette.muted }}>{parsed.issuer} {parsed.issueDate ? `- ${parsed.issueDate}` : ''}</div>
                          </li>
                          )
                      })}
                  </ul>
              </div>
          )}
      </div>
    </div>
  );
}
