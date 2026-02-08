import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { locations } from "@/data/schema"
import { cx } from "@/lib/utils"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"

interface Country {
  name: string
  selected: boolean
}

interface Continent {
  name: string
  countries: Country[]
}

interface ContinentCheckboxProps {
  continent: Continent
  onSelectionChange: (continent: string, countries: string[]) => void
}

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const ContinentCheckbox = ({
  continent,
  onSelectionChange,
}: ContinentCheckboxProps) => {
  const allSelected = continent.countries.every((country) => country.selected)
  const someSelected = continent.countries.some((country) => country.selected)

  const handleContinentChange = (checked: boolean) => {
    const updatedCountries = continent.countries.map((country) => country.name)
    onSelectionChange(continent.name, checked ? updatedCountries : [])
  }

  const handleCountryChange = (countryName: string, checked: boolean) => {
    const updatedCountries = continent.countries
      .filter((country) => country.selected || country.name === countryName)
      .map((country) => country.name)

    if (!checked) {
      const index = updatedCountries.indexOf(countryName)
      if (index > -1) updatedCountries.splice(index, 1)
    }

    onSelectionChange(continent.name, updatedCountries)
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-xs)]">
      <div className="reports-continent-header-sticky flex items-center gap-[var(--spacing-xs)] p-[var(--reports-continent-header-padding)]">
        <Checkbox
          id={continent.name}
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={handleContinentChange}
        />
        <Label className="w-full text-base sm:text-sm font-medium" htmlFor={continent.name}>
          {continent.name}
        </Label>
      </div>
      <div className="ml-[var(--reports-country-item-margin)] flex flex-col gap-[var(--spacing-xs)]">
        {continent.countries.map((country) => (
          <div key={country.name} className="flex items-center gap-[var(--spacing-xs)]">
            <Checkbox
              id={country.name}
              checked={country.selected}
              onCheckedChange={(checked: boolean) =>
                handleCountryChange(country.name, checked)
              }
            />
            <Label className="text-base sm:text-sm w-full" htmlFor={country.name}>
              {country.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterCountry() {
  const [selectedCountries, setSelectedCountries] = useQueryState<string[]>(
    "countries",
    {
      defaultValue: [],
      parse: (value: string) => (value ? value.split("+") : []),
      serialize: (value: string[]) => value.join("+"),
    },
  )

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const continents = useMemo(() => {
    return locations.map((location) => ({
      name: location.name,
      countries: location.countries.map((country) => ({
        name: country,
        selected: selectedCountries.includes(country),
      })),
    }))
  }, [selectedCountries])

  const filteredContinents = useMemo(() => {
    return continents
      .map((continent) => ({
        ...continent,
        countries: continent.countries.filter((country) =>
          country.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()),
        ),
      }))
      .filter(
        (continent) =>
          continent.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          continent.countries.length > 0,
      )
  }, [continents, debouncedSearchTerm])

  const handleSelectionChange = (continent: string, countries: string[]) => {
    const otherSelectedCountries = selectedCountries.filter(
      (country: string) =>
        !locations
          .find((loc) => loc.name === continent)
          ?.countries.includes(country),
    )
    setSelectedCountries([...otherSelectedCountries, ...countries])
  }

  return (
    <div>
      <Label htmlFor="location-filter" className="reports-filter-label block">
        Locations
      </Label>
      <Popover modal={true}>
        <PopoverTrigger
          asChild
          className="mt-[var(--spacing-reports-filter-label-margin)] w-full md:w-fit"
          id="location-filter"
        >
          <Button
            variant="secondary"
            className={cx(
              "reports-filter-button flex justify-start gap-[var(--spacing-reports-filter-gap)] font-normal md:justify-center",
            )}
          >
            Selected Locations
            <span className="flex shrink-0 items-center justify-center rounded bg-[var(--badge-neutral-bg)] px-1 tabular-nums text-[var(--badge-neutral-text)]">
              {selectedCountries.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[var(--z-reports-popover)] min-w-[calc(var(--radix-popover-trigger-width))] max-w-[calc(var(--radix-popover-trigger-width))] sm:min-w-56 sm:max-w-56"
          align="end"
        >
          <div className="flex h-full max-h-[var(--reports-country-list-max-height)] flex-col gap-[var(--spacing-reports-filter-gap)]">
            <Input
              placeholder="Search for continent or country"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="sm:[&>input]:py-1.5"
            />
            <div className="flex-grow overflow-y-auto">
              <div className={filteredContinents.length > 0 ? "space-y-[var(--spacing-sm)]" : ""}>
                {filteredContinents.length > 0 ? (
                  filteredContinents.map((continent) => (
                    <ContinentCheckbox
                      key={continent.name}
                      continent={continent}
                      onSelectionChange={handleSelectionChange}
                    />
                  ))
                ) : (
                  <span className="mt-[var(--spacing-xs)] block text-base sm:text-sm text-[var(--muted-foreground)]">
                    No results found
                  </span>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { FilterCountry }
