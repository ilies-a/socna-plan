import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { PlanElement, PlanElementsHelper, SheetDataEditable } from "@/entities";
import { selectPlanElements } from "@/redux/plan/plan.selectors";
import { useRef } from "react";
import { useSelector } from "react-redux";


type Props = {
    editable: SheetDataEditable
}
const CameraButton: React.FC<Props> = ({editable}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    // const [inputNumero, setInputNumero] = useState<string>("");
    const savePlan = useSavePlan();

    const handleButtonClick = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };
  
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // const base64Data = await convertToBase64(file);
        const base64Data = await compressImage(file);
        const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
        editable.photoURLs.push(base64Data);
        savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
      }
    };
  
    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 400;
              const MAX_HEIGHT = 400;
              let width = img.width;
              let height = img.height;
    
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
    
              canvas.width = width;
              canvas.height = height;
    
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
    
              const compressedBase64Data = canvas.toDataURL('image/jpeg', 0.5); // Adjust the quality level as needed
    
              resolve(compressedBase64Data);
            };
            img.src = event.target?.result as string;
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };
    return (
      <>
        <button onClick={handleButtonClick}>&#128247;</button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </>
    );
  };
  
  export default CameraButton;