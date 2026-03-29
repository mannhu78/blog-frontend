import Cropper from "react-easy-crop"
import { useState } from "react"

function CropAvatar({ image, onCropDone, onClose }) {

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropComplete = (_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }
    const handleDone = () => {
        onCropDone(croppedAreaPixels)
        onClose() 
    }

    return (
        <div style={{ marginTop: "20px" }}>

            <div style={{ position: "relative", width: "100%", height: 300 }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round" 
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>

            <button onClick={handleDone}>Crop</button>
            <button onClick={onClose}>Cancel</button>

        </div>
    )
}

export default CropAvatar