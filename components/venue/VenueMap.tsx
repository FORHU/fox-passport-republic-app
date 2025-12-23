"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Venue } from "@/types/venue";
import { MapPin, ArrowRight } from "lucide-react";

interface Props {
  venues: Venue[];
  center: { lat: number; lng: number } | null;
  loading: boolean;
}

export default function VenueMap({ venues, center, loading }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isCesiumLoaded, setIsCesiumLoaded] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (!isCesiumLoaded || !mapContainer.current || viewerRef.current) return;

    const Cesium = (window as any).Cesium;
    (window as any).CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/';

    const initMap = async () => {
      try {
        console.log("🚀 Initializing Cesium with fromAssetId(3954)...");

        // 1. AUTHENTICATE
        const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
        if (token) Cesium.Ion.defaultAccessToken = token;

        const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(3954);

        // 3. CREATE VIEWER
        const viewer = new Cesium.Viewer(mapContainer.current, {
          imageryProvider: imageryProvider,
          baseLayerPicker: false, 
          geocoder: false,        
          timeline: false,        
          animation: false,       
          sceneModePicker: false, 
          homeButton: false,      
          navigationHelpButton: false,
          fullscreenButton: false,
          scene3DOnly: true,
          requestRenderMode: false,
        });

        // 4. LOAD TERRAIN (Optional, also async recommended)
        try {
            const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
                Cesium.IonResource.fromAssetId(1)
            );
            viewer.terrainProvider = terrainProvider;
        } catch (e) {
            console.warn("Terrain failed to load, continuing flat.");
        }

        // UI Cleanup
        const credit = viewer.cesiumWidget.creditContainer as HTMLElement;
        if (credit) credit.style.display = "none";
        
        // Visibility
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.globe.enableLighting = true; 

        viewerRef.current = viewer;
        updateMarkers(viewer, Cesium);
        console.log("✅ Cesium Initialized!");

      } catch (error) {
        console.error("❌ Error initializing Cesium:", error);
      }
    };

    initMap();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCesiumLoaded]);

  // --- MARKER LOGIC ---
  const updateMarkers = (v: any, Cesium: any) => {
    v.entities.removeAll();
    venues.forEach((venue) => {
      const priceK = venue.price ? Math.round(venue.price / 1000) : 0;
      v.entities.add({
        position: Cesium.Cartesian3.fromDegrees(venue.longitude, venue.latitude),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#8b5cf6'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: `₱${priceK}k`,
          font: 'bold 14px sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#8b5cf6'),
          outlineWidth: 4,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -15),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: 500000, 
        },
        properties: { venueId: venue.id },
      });
    });

    if (venues.length > 0) {
      const positions = venues.map((v: Venue) => Cesium.Cartesian3.fromDegrees(v.longitude, v.latitude));
      const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
      v.camera.flyToBoundingSphere(boundingSphere, {
         offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), boundingSphere.radius * 2.5)
      });
    }
    
    const handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas);
    handler.setInputAction((click: any) => {
      const pickedObject = v.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const venueId = pickedObject.id.properties?.venueId?.getValue();
        const venue = venues.find((x) => x.id === venueId);
        if (venue) setSelectedVenue(venue);
      } else {
        setSelectedVenue(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };

  const handleNavigateToVenue = (id: string) => {
    router.push(`/venue/${id}`);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden bg-gray-900 shadow-xl border border-gray-800">
      <link rel="stylesheet" href="https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Widgets/widgets.css" />
      <Script 
        src="https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js" 
        strategy="afterInteractive"
        onLoad={() => setIsCesiumLoaded(true)}
      />

      <div ref={mapContainer} className="w-full h-full" id="cesiumContainer" />
      
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <span className="text-purple-900 font-semibold">Finding best venues...</span>
        </div>
      )}

      {selectedVenue && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-2xl z-40 p-5">
            <h3 className="font-bold text-xl mb-2 text-gray-900">{selectedVenue.name}</h3>
            <div className="flex items-center text-gray-500 text-xs mb-4">
               <MapPin size={14} className="mr-2" />
               <span>{selectedVenue.address}</span>
            </div>
            <button onClick={() => handleNavigateToVenue(selectedVenue.id)} className="w-full bg-violet-600 text-white py-2 rounded-lg">
              View Details <ArrowRight size={16} className="inline ml-1"/>
            </button>
        </div>
      )}
    </div>
  );
}