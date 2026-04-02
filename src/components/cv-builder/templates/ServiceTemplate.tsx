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

export function ServiceTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const sectionHeaderStyle = {
    fontSize: '12pt',
    fontWeight: 700,
    color: palette.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    textAlign: 'center' as const,
    marginBottom: '16px',
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

  const renderSectionHeader = (title: string) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '16px' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: palette.chipBorder }}></div>
          <h2 style={{ ...sectionHeaderStyle, marginBottom: 0 }}>{title}</h2>
          <div style={{ height: '1px', flex: 1, backgroundColor: palette.chipBorder }}></div>
      </div>
  );

  const renderExperience = () => (
    data.work_experiences && data.work_experiences.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        {renderSectionHeader(l.experience)}
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '16px', display: 'flex', gap: '20px' }}>
            <div style={{ width: '130px', flexShrink: 0, textAlign: 'right', color: palette.accent, fontWeight: 600, fontSize: '9.5pt', paddingTop: '2px' }}>
                {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
            </div>
            <div style={{ flex: 1 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '11pt', color: palette.title }}>{normalizeText(exp.position)}</span>
                {isMeaningfulCompany(exp.company) && (
                  <span style={{ color: palette.muted, fontWeight: 500 }}> — {exp.company}</span>
                )}
              </div>
              {normalizeText(htmlToPlainText(exp.description)) && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.7', wordBreak: 'break-word', textAlign: 'justify' }}>
                  {toBulletLines(exp.description).map((line, j) => (
                    <li key={j} style={{ marginBottom: '4px' }}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const renderEducation = () => (
    data.educations && data.educations.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        {renderSectionHeader(l.education)}
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '12px', display: 'flex', gap: '20px' }}>
            <div style={{ width: '130px', flexShrink: 0, textAlign: 'right', color: palette.accent, fontWeight: 600, fontSize: '9.5pt', paddingTop: '2px' }}>
                 {toTimeline(edu.duration, edu.start_date, edu.end_date, l.present)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: palette.title, fontSize: '10.5pt' }}>{normalizeText(edu.school)}</div>
              {(normalizeText(edu.degree) || normalizeText(edu.major)) && (
                  <div style={{ color: palette.muted, marginTop: '2px' }}>
                      {normalizeText(edu.degree)} {normalizeText(edu.degree) && normalizeText(edu.major) ? 'trong' : ''} {normalizeText(edu.major)}
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const renderProjects = () => (
    data.projects && data.projects.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        {renderSectionHeader(l.projects)}
        {data.projects.map((prj, i) => (
          <div key={i} style={{ marginBottom: '16px', display: 'flex', gap: '20px' }}>
            <div style={{ width: '130px', flexShrink: 0, textAlign: 'right', color: palette.accent, fontWeight: 600, fontSize: '9.5pt', paddingTop: '2px' }}>
                 {normalizeText(prj.duration)}
            </div>
            <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: palette.title, fontSize: '10.5pt' }}>{normalizeText(prj.name)}</span>
                
                {normalizeText(htmlToPlainText(prj.description)) && (
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.7', wordBreak: 'break-word', textAlign: 'justify' }}>
                    {toBulletLines(prj.description).map((line, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                    ))}
                </ul>
                )}
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const renderCertificates = () => (
    data.certificates && data.certificates.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
        {renderSectionHeader(l.certificates)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingLeft: '150px' }}>
          {data.certificates.map((cert, i) => {
             const parsed = parseCertificate(cert as CertificateLike);
             return (
               <div key={i}>
                  <div style={{ fontWeight: 600, color: palette.title }}>{parsed.name}</div>
                  <div style={{ fontSize: '9pt', color: palette.muted }}>{parsed.issuer} {parsed.issueDate ? `- ${parsed.issueDate}` : ''}</div>
               </div>
             )
          })}
        </div>
      </div>
    ) : null
  );

  const renderLanguages = () => (
    data.languages && data.languages.length > 0 ? (
      <div style={{ marginBottom: '24px' }}>
         {renderSectionHeader(l.languages)}
         <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: palette.text, flexWrap: 'wrap' }}>
            {data.languages.map((lang, i) => {
              const name = typeof lang === 'string' ? lang : (lang as any).name ?? '';
              const prof = typeof lang !== 'string' ? (lang as any).proficiency : '';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{fontWeight: 700, fontSize: '11pt'}}>{name}</span>
                    {prof && <span style={{color: palette.muted, fontSize: '9pt'}}>{prof}</span>}
                </div>
              );
            })}
        </div>
      </div>
    ) : null
  );

  const renderSkills = () => (
      uniqueSkills.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
            {renderSectionHeader(l.skills)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
            {uniqueSkills.map((skill, i) => (
            <span
                key={i}
                style={{
                    color: palette.title,
                    fontSize: '10pt',
                    fontWeight: 500,
                    borderBottom: `1px solid ${palette.chipBorder}`,
                }}
            >
                {normalizeText(skill.name)}
            </span>
            ))}
        </div>
        </div>
      ) : null
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '297mm', padding: '15mm 20mm', fontFamily: "'Georgia', serif, 'Times New Roman'" }}>
      {/* Header - Centered */}
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {data.avatarUrl && !avatarLoadFailed ? (
                 <img
                    src={data.avatarUrl}
                    alt="Avatar"
                    onError={() => setAvatarLoadFailed(true)}
                    style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${palette.chipBorder}` }}
                 />
            ) : (
                <div style={{ 
                    width: '90px', height: '90px', borderRadius: '50%', 
                    backgroundColor: palette.chipBg, color: palette.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 600, border: `1px solid ${palette.chipBorder}` 
                }}>
                    {getInitials(displayName)}
                </div>
            )}
         </div>

         <h1 style={{ fontSize: '26pt', fontWeight: 400, color: palette.title, margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
            {displayName}
         </h1>
         {displayTitle && (
            <div style={{ fontSize: '12pt', color: palette.accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
                {displayTitle}
            </div>
         )}

         <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', fontSize: '9.5pt', color: palette.muted }}>
             {contactParts.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: palette.accent }}></span>
                    {item}
                </div>
             ))}
         </div>
      </header>

      {summaryText && (
        <div style={{ marginBottom: '32px', textAlign: 'center', padding: '0 40px' }}>
             <p style={{ margin: 0, color: palette.text, lineHeight: '1.8', fontStyle: 'italic', fontSize: '10.5pt' }}>
                 "{summaryText}"
             </p>
        </div>
      )}

      {renderExperience()}
      {renderEducation()}
      {renderSkills()}
      {renderProjects()}
      {renderCertificates()}
      {renderLanguages()}
    </div>
  );
}
