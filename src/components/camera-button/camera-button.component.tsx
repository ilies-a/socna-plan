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
        const base64Data = await convertToBase64(file);
        console.log(base64Data); // Do something with the base64 data here
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