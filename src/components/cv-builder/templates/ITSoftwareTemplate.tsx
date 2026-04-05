import {
  type CVTemplateProps,
  mixHex,
  normalizeText,
  getInitials,
  htmlToPlainText,
  toBulletLines,
  parseCertificate,
  toTimeline,
  type CertificateLike,
} from './common';

export function ITSoftwareTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const dividerColor = mixHex(palette.accent, '#0f172a', 0.65);
  const iconColor = mixHex(palette.accent, '#64748b', 0.45);
  const mutedLight = mixHex(palette.muted, '#cbd5e1', 0.35);
  const mainBg = mixHex(palette.accentSoft, '#ffffff', 0.35);
  const panelBg = mixHex(palette.accentSoft, '#ffffff', 0.6);
  const summaryMarkerColor = mixHex(palette.accent, '#ef4444', 0.55);
  const roleColor = mixHex(palette.accent, '#2563eb', 0.4);
  const projectColor = mixHex(palette.accent, '#1d4ed8', 0.35);
  const promptColor = mixHex(palette.accent, '#ffffff', 0.28);

  const sectionHeaderStyle = {
    fontSize: '13pt',
    fontWeight: 700,
    color: palette.accent,
    borderBottom: `1px solid ${dividerColor}`,
    paddingBottom: '6px',
    marginBottom: '16px',
    marginTop: '0px',
    textTransform: 'uppercase' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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

    const renderSectionHeader = (title: string, icon?: string) => (
      <h2 style={sectionHeaderStyle}>
      {icon ? <span style={{ color: iconColor, fontFamily: 'monospace' }}>{icon}</span> : null} {title}
      </h2>
  );

  const renderExperience = () => (
    data.work_experiences && data.work_experiences.length > 0 ? (
      <div style={{ marginBottom: '28px' }}>
        {renderSectionHeader(l.experience, '~/')}
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '11pt', color: palette.title }}>{normalizeText(exp.position)}</span>
                <span style={{ fontSize: '9.5pt', color: palette.muted, fontFamily: 'monospace' }}>
                    [{toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}]
                </span>
            </div>
            {normalizeText(exp.company) && (
                <div style={{ color: mutedLight, fontWeight: 500, fontSize: '10pt', marginTop: '2px' }}>@ {exp.company}</div>
            )}
            {normalizeText(htmlToPlainText(exp.description)) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word', textAlign: 'justify', listStyleType: 'square' }}>
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

  const renderProjects = () => (
    data.projects && data.projects.length > 0 ? (
      <div style={{ marginBottom: '28px' }}>
         {renderSectionHeader(l.projects, './')}
        {data.projects.map((prj, i) => (
          <div key={i} style={{ marginBottom: '20px', borderLeft: `2px solid ${palette.chipBorder}`, paddingLeft: '16px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{ fontWeight: 700, fontSize: '11pt', color: projectColor }}>{normalizeText(prj.name)}</span>
                {normalizeText(prj.duration) && (
                  <span style={{ fontSize: '9.5pt', color: palette.muted, fontFamily: 'monospace' }}>[{prj.duration}]</span>
                )}
            </div>
            {normalizeText(htmlToPlainText(prj.description)) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.6', wordBreak: 'break-word', textAlign: 'justify', listStyleType: 'square' }}>
                {toBulletLines(prj.description).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            )}
            {prj.technologies && prj.technologies.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                 {prj.technologies.map((tech, idx) => (
                    <span key={idx} style={{ fontSize: '8.5pt', fontFamily: 'monospace', color: palette.accent, backgroundColor: palette.chipBg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${palette.chipBorder}` }}>
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

  const renderEducation = () => (
    data.educations && data.educations.length > 0 ? (
      <div style={{ marginBottom: '28px' }}>
         {renderSectionHeader(l.education, '../')}
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '10.5pt', color: palette.title }}>{normalizeText(edu.school)}</span>
                <span style={{ fontSize: '9.5pt', color: palette.muted, fontFamily: 'monospace' }}>
                    [{toTimeline(edu.duration, edu.start_date, edu.end_date, l.present)}]
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px', fontSize: '10pt' }}>
                <span style={{ color: mutedLight, fontWeight: 500 }}>{normalizeText(edu.major)} {normalizeText(edu.degree) && `(${normalizeText(edu.degree)})`}</span>
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const renderCertificates = () => (
     data.certificates && data.certificates.length > 0 ? (
        <div style={{ marginBottom: '28px' }}>
    {renderSectionHeader(l.certificates)}
        <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.text }}>
                {data.certificates.map((cert, i) => {
                    const parsed = parseCertificate(cert as CertificateLike);
                    return (
                    <li key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, color: palette.title, fontSize: '10pt' }}>{parsed.name}</div>
              <div style={{ fontSize: '9.5pt', color: mutedLight, marginTop: '2px' }}>{parsed.issuer} {parsed.issueDate ? `- ${parsed.issueDate}` : ''}</div>
                    </li>
                    )
                })}
            </ul>
        </div>
     ) : null
  );

  return (
    <div style={{ backgroundColor: mainBg, minHeight: '297mm', fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" }}>
       <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '297mm' }}>
         <aside style={{ backgroundColor: palette.sidebarBg, color: palette.sidebarText, borderRight: `1px solid ${dividerColor}`, padding: '16mm 12mm', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                   {data.avatarUrl && !avatarLoadFailed ? (
                        <img
                            src={data.avatarUrl}
                            alt="Avatar"
                            onError={() => setAvatarLoadFailed(true)}
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${mixHex(palette.accent, '#ffffff', 0.45)}`, backgroundColor: mixHex(palette.sidebarBg, '#ffffff', 0.08) }}
                        />
                   ) : (
               <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `2px solid ${mixHex(palette.accent, '#ffffff', 0.45)}`, backgroundColor: mixHex(palette.sidebarBg, '#ffffff', 0.08), color: palette.sidebarText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 600 }}>
                           {getInitials(displayName)}
                       </div>
                   )}
               </div>

               {uniqueSkills.length > 0 && (
                   <div style={{ marginBottom: '32px' }}>
               <h2 style={{ fontSize: '11pt', fontWeight: 700, color: palette.accent, textTransform: 'uppercase', marginBottom: '12px', borderBottom: `1px solid ${dividerColor}`, paddingBottom: '4px' }}>{l.skills}</h2>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {uniqueSkills.map((skill, i) => (
                  <div key={i} style={{ color: palette.sidebarText, fontSize: '9.5pt', fontFamily: 'monospace' }}>
                    <span style={{ color: promptColor }}>&gt;</span> {normalizeText(skill.name)}
                              </div>
                           ))}
                       </div>
                   </div>
               )}

               {data.languages && data.languages.length > 0 && (
                   <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 700, color: palette.accent, textTransform: 'uppercase', marginBottom: '12px', borderBottom: `1px solid ${dividerColor}`, paddingBottom: '4px' }}>{l.languages}</h2>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', color: palette.sidebarText, fontSize: '9.5pt', fontFamily: 'monospace' }}>
                            {data.languages.map((lang, i) => {
                                const name = typeof lang === 'string' ? lang : (lang as any).name ?? '';
                                const prof = typeof lang !== 'string' ? (lang as any).proficiency : '';
                                return (
                                <li key={i} style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: palette.sidebarText }}>{name}</span>
                          {prof && <span style={{color: mutedLight}}>{prof}</span>}
                                </li>
                                );
                            })}
                        </ul>
                   </div>
               )}
               
               <div style={{ marginTop: 'auto' }}>
                  <h2 style={{ fontSize: '11pt', fontWeight: 700, color: palette.accent, textTransform: 'uppercase', marginBottom: '12px', borderBottom: `1px solid ${dividerColor}`, paddingBottom: '4px' }}>Contact</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '9pt', color: mutedLight, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {contactParts.map((item, idx) => (
                            <div key={idx}>{item}</div>
                        ))}
                    </div>
               </div>
           </aside>

           {/* Main Content */}
       <main style={{ padding: '16mm 16mm', color: palette.text }}>
               <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28pt', fontWeight: 800, color: palette.title, margin: '0 0 8px 0', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                        {displayName}
                    </h1>
                    {displayTitle && (
            <div style={{ fontSize: '13pt', color: roleColor, fontWeight: 600, fontFamily: 'monospace' }}>
                            &lt;{displayTitle.replace(/\s+/g, '')} /&gt;
                        </div>
                    )}
               </header>

               {summaryText && (
          <div style={{ marginBottom: '32px', borderLeft: `3px solid ${summaryMarkerColor}`, paddingLeft: '16px', backgroundColor: panelBg, padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
            <p style={{ margin: 0, color: palette.text, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify', fontSize: '10.5pt' }}>
              <span style={{ color: summaryMarkerColor, fontFamily: 'monospace' }}>/* </span>
                          {summaryText}
              <span style={{ color: summaryMarkerColor, fontFamily: 'monospace' }}> */</span>
                      </p>
                  </div>
               )}

               {renderExperience()}
               {renderProjects()}
               {renderEducation()}
               {renderCertificates()}
           </main>
       </div>
    </div>
  );
}
