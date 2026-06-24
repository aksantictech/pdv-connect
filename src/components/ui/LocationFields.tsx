"use client";

import {
COUNTRIES,
isKinshasaCity,
KINSHASA_COMMUNES,
} from "../../lib/form-options";

type CountrySelectProps = {
value: string;
onChange: (value: string) => void;
className: string;
required?: boolean;
disabled?: boolean;
};

type CommuneFieldProps = {
city: string;
value: string;
onChange: (value: string) => void;
className: string;
required?: boolean;
disabled?: boolean;
placeholder?: string;
};

export function CountrySelect({
value,
onChange,
className,
required = false,
disabled = false,
}: CountrySelectProps) {
return (
<select
value={value}
onChange={(event) => onChange(event.target.value)}
className={className}
required={required}
disabled={disabled}
> <option value="">Choisissez un pays</option>

  {COUNTRIES.map((country) => (
    <option key={country} value={country}>
      {country}
    </option>
  ))}
</select>

);
}

export function CommuneField({
city,
value,
onChange,
className,
required = false,
disabled = false,
placeholder = "Ex. Lemba",
}: CommuneFieldProps) {
if (isKinshasaCity(city)) {
return (
<select
value={value}
onChange={(event) => onChange(event.target.value)}
className={className}
required={required}
disabled={disabled}
> <option value="">Choisissez une commune</option>

    {KINSHASA_COMMUNES.map((commune) => (
      <option key={commune} value={commune}>
        {commune}
      </option>
    ))}
  </select>
);


}

return (
<input
value={value}
onChange={(event) => onChange(event.target.value)}
className={className}
placeholder={placeholder}
required={required}
disabled={disabled}
/>
);
}
