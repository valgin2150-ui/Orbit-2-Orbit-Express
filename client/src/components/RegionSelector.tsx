import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegionSelectorProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export default function RegionSelector({
  selectedRegion,
  onSelectRegion,
}: RegionSelectorProps) {
  return (
    <Select value={selectedRegion} onValueChange={onSelectRegion}>
      <SelectTrigger className="w-full bg-white border-gray-200">
        <SelectValue placeholder="Select a launch site" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any Launch Site</SelectItem>
        
        <SelectGroup>
          <SelectLabel>United States</SelectLabel>
          <SelectItem value="cape_canaveral">Cape Canaveral, Florida</SelectItem>
          <SelectItem value="kennedy">Kennedy Space Center, Florida</SelectItem>
          <SelectItem value="vandenberg">Vandenberg SFB, California</SelectItem>
          <SelectItem value="wallops">Wallops Flight Facility, Virginia</SelectItem>
          <SelectItem value="spaceport_america">Spaceport America, New Mexico</SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="kourou">Kourou, French Guiana (ESA)</SelectItem>
          <SelectItem value="baikonur">Baikonur Cosmodrome, Kazakhstan</SelectItem>
          <SelectItem value="plesetsk">Plesetsk Cosmodrome, Russia</SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="sriharikota">Satish Dhawan Space Centre, Sriharikota, India</SelectItem>
          <SelectItem value="jiuquan">Jiuquan Satellite Launch Center, Gansu, China</SelectItem>
          <SelectItem value="xichang">Xichang Satellite Launch Center, Sichuan, China</SelectItem>
          <SelectItem value="tanegashima">Tanegashima Space Center, Japan</SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Other Regions</SelectLabel>
          <SelectItem value="mahia">Rocket Lab Launch Complex, Mahia, New Zealand</SelectItem>
          <SelectItem value="alcantara">Alcântara Space Center, Brazil</SelectItem>
          <SelectItem value="woomera">Woomera Test Range, Australia</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
