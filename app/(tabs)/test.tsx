import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import MapView, { Marker, type LatLng, type MapPressEvent } from 'react-native-maps';

const SF_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function TestScreen() {
  const [markerCoord, setMarkerCoord] = useState<LatLng | null>(null);

  const handleMapPress = (e: MapPressEvent) => {
    setMarkerCoord(e.nativeEvent.coordinate);
  };

  return (
    <MapView style={styles.map} initialRegion={SF_REGION} onPress={handleMapPress}>
      {markerCoord && (
        <Marker coordinate={markerCoord}>
          <View style={styles.marker}>
            <FastImage
              source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
              style={styles.logo}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.price}>$4.29</Text>
          </View>
        </Marker>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ccc',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 21,
    marginTop: 3,
  },
});
