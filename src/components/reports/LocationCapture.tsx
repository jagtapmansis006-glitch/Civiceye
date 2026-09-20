import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeolocation } from "@/hooks/useGeolocation";

export interface LocationValue {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

export function LocationCapture({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}) {
  const geo = useGeolocation();

  function useDevice() {
    geo.capture();
  }

  if (
    geo.position &&
    (geo.position.latitude !== value.latitude || geo.position.longitude !== value.longitude)
  ) {
    onChange({ ...value, latitude: geo.position.latitude, longitude: geo.position.longitude });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="soft" onClick={useDevice} disabled={geo.loading}>
          <LocateFixed /> {geo.loading ? "Locating…" : "Use my current location"}
        </Button>
        {value.latitude != null && value.longitude != null && (
          <span className="text-sm text-verd">
            Pinned at {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
            {geo.position?.accuracy ? ` (±${Math.round(geo.position.accuracy)} m)` : ""}
          </span>
        )}
      </div>
      {geo.error && <p className="text-sm text-alert">{geo.error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            inputMode="decimal"
            value={value.latitude ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                latitude: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            inputMode="decimal"
            value={value.longitude ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                longitude: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Landmark / address</Label>
          <Input
            id="address"
            placeholder="e.g. Opposite Ward 3 office"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
