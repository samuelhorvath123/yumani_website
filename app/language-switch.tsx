import './language-switch.css';

export default function LanguageSwitch() {
  return (
    <fieldset className="language-switch" aria-label="Website language" data-language="en">
      <button type="button" lang="en" aria-label="English" aria-pressed="true">EN</button>
      <button type="button" lang="sk" aria-label="Slovenčina" aria-pressed="false" disabled title="Slovak is not available yet">SK</button>
    </fieldset>
  );
}
