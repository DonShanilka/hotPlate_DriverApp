import MapView, { Marker, Region } from "react-native-maps";

interface Props {
  latitude: number;
  longitude: number;
}

export default function DriverMap({ latitude, longitude }: Props) {
  const region: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
    >
      <Marker
        coordinate={{
          latitude,
          longitude,
        }}
        title="Your Location"
        description="HotPlate Driver"
      />
    </MapView>
  );
}