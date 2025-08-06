"use client"

import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api"
import { useMemo } from "react"

const GoogleMapComponent = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })
  const center = useMemo(() => ({ lat: 10.274186520216851, lng: 123.77769061349386 }), [])

  if (!isLoaded) return <div>Loading...</div>
  return (
    <GoogleMap zoom={15} center={center} mapContainerClassName="w-full h-full">
      <Marker position={center} />
    </GoogleMap>
  )
}

export default GoogleMapComponent