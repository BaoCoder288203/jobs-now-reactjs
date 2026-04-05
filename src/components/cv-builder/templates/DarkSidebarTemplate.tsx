import React from 'react';
import {
  type CVTemplateProps,
  mixHex,
  normalizeText,
  getInitials,
  htmlToPlainText,
  toBulletLines,
  parseCertificate,
  toTimeline,
  isMeaningfulCompany,
  type CertificateLike
} from './common';

export function DarkSidebarTemplate({ data, palette, l, avatarLoadFailed, setAvatarLoadFailed }: CVTemplateProps) {
  const sectionHeaderStyle = {
    fontSize: '11pt',
    fontWeight: 700,
    color: palette.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    borderBottom: `1px solid ${palette.chipBorder}`,
    paddingBottom: '4px',
    marginBottom: '10px',
  };

  const sidebarSectionHeaderStyle = {
    ...sectionHeaderStyle,
    color: palette.accent,
    borderBottom: `1px solid ${mixHex(palette.accent, '#ffffff', 0.55)}`,
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
      <div style={{ marginBottom: '16px' }}>
        <h2 style={sectionHeaderStyle}>{l.experience}</h2>
        {data.work_experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '10.5pt', color: palette.title }}>{normalizeText(exp.position)}</span>
                {isMeaningfulCompany(exp.company) && (
                  <span style={{ color: palette.muted }}> — {exp.company}</span>
                )}
              </div>
              <span style={{ fontSize: '9pt', color: palette.muted, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
              </span>
            </div>
            {normalizeText(htmlToPlainText(exp.description)) && (
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.65', wordBreak: 'break-word' }}>
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
      <div style={{ marginBottom: '16px' }}>
        <h2 style={sectionHeaderStyle}>{l.education}</h2>
        {data.educations.map((edu, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontWeight: 600, color: palette.title }}>{normalizeText(edu.school)}</span>
                {normalizeText(edu.degree) && <span style={{ color: palette.muted }}> — {edu.degree}</span>}
                {normalizeText(edu.major) && <span style={{ color: palette.muted }}> ({edu.major})</span>}
              </div>
              <span style={{ fontSize: '9pt', color: palette.muted, whiteSpace: 'nowrap', marginLeft: '12px' }}>
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
      <div style={{ marginBottom: '16px' }}>
        <h2 style={sectionHeaderStyle}>{l.projects}</h2>
        {data.projects.map((prj, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: palette.title }}>{normalizeText(prj.name)}</span>
            {normalizeText(prj.duration) && (
              <span style={{ fontSize: '9pt', color: palette.muted, marginLeft: '8px' }}>{prj.duration}</span>
            )}
            {normalizeText(htmlToPlainText(prj.description)) && (
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: palette.text, lineHeight: '1.65', wordBreak: 'break-word' }}>
                {toBulletLines(prj.description).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            )}
            {prj.technologies && prj.technologies.length > 0 && (
              <p style={{ color: palette.muted, fontSize: '9pt', marginTop: '2px' }}>
                {l.technology}: {prj.technologies.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    ) : null
  );

  const renderCertificates = () => (
    data.certificates && data.certificates.length > 0 ? (
      <div style={{ marginBottom: '16px' }}>
        <h2 style={sectionHeaderStyle}>{l.certificates}</h2>
        <ul style={{ margin: 0, paddingLeft: '18px', color: palette.text, lineHeight: '1.65', wordBreak: 'break-word' }}>
          {data.certificates.map((cert, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>
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
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', lineHeight: '1.55' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'inherit', lineHeight: '1.6', wordBreak: 'break-word' }}>
        {data.languages.map((lang, i) => (
          <span key={i} style={{ display: 'inline-block' }}>
            {typeof lang === 'string' ? lang : (lang as { name?: string; proficiency?: string }).name ?? ''}
            {typeof lang !== 'string' && (lang as { proficiency?: string }).proficiency
              ? ` (${(lang as { proficiency?: string }).proficiency})`
              : ''}
          </span>
        ))}
      </div>
    ) : null
  );

  const renderContact = () => (
    contactParts.length > 0 ? (
      <div style={{ color: 'inherit', fontSize: '10pt', lineHeight: '1.8', wordBreak: 'break-word' }}>
        {contactParts.map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </div>
    ) : null
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '76mm 1fr', minHeight: '297mm' }}>
      <aside
        style={{
          background: palette.sidebarBg,
          color: palette.sidebarText,
          padding: '11mm 8mm',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              height: '66px',
              width: '66px',
              borderRadius: '50%',
              border: `2px solid ${mixHex(palette.accent, '#ffffff', 0.35)}`,
              overflow: 'hidden',
              background: '#ffffff30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
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
        </div>

        <div
          style={{
            background: palette.accent,
            borderRadius: '6px',
            padding: '8px 10px',
            textAlign: 'center',
            minHeight: '64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1 style={{ fontSize: '16.5pt', fontWeight: 700, color: '#111827', margin: 0, lineHeight: '1.25' }}>{displayName}</h1>
          {displayTitle && <p style={{ margin: '4px 0 0 0', fontSize: '10pt', color: mixHex('#111827', '#ffffff', 0.35) }}>{displayTitle}</p>}
        </div>

        <div>
          <h2 style={sidebarSectionHeaderStyle}>Liên hệ</h2>
          {renderContact()}
        </div>

        <div>
          <h2 style={sidebarSectionHeaderStyle}>{l.skills}</h2>
          {uniqueSkills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'flex-start' }}>
              {uniqueSkills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#ffffff18',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '9.3pt',
                    fontWeight: 500,
                    border: '1px solid #ffffff35',
                    lineHeight: '1.25',
                    textAlign: 'left',
                    wordBreak: 'break-word',
                  }}
                >
                  {normalizeText(skill.name)}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: '#ffffffba', fontSize: '9.5pt' }}>Chưa có kỹ năng</p>
          )}
        </div>

        {hasLanguages && (
          <div>
            <h2 style={sidebarSectionHeaderStyle}>{l.languages}</h2>
            {renderLanguages()}
          </div>
        )}
      </aside>

      <main style={{ padding: '13mm 12mm', display: 'flex', flexDirection: 'column' }}>
        {summaryText && (
          <div style={{ marginBottom: '14px', background: palette.accentSoft, borderRadius: '8px', padding: '10px 12px', borderLeft: `3px solid ${palette.accent}` }}>
            <h2 style={{ ...sectionHeaderStyle, borderBottom: 'none', marginBottom: '6px', paddingBottom: 0 }}>Mục tiêu nghề nghiệp</h2>
            <p style={{ margin: 0, color: palette.text, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{summaryText}</p>
          </div>
        )}

        {renderExperience()}
        {renderEducation()}
        {renderProjects()}
        {renderCertificates()}
      </main>
    </div>
  );
}
