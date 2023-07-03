import { Size, Vector2D } from "@/entities";
import { SELECTED_ITEM_COLOR } from "@/global";
import { Rect } from "react-konva";

type Props = {
    size:Size
    scale:number
    selected: boolean
};

const DEPComponent: React.FC<Props> = ({size, scale, selected}) => {
    return (
        <Rect
            width={size.width * scale}
            height={size.height * scale}
            stroke={selected?SELECTED_ITEM_COLOR:"#00b050"}
            strokeWidth={5 * scale}
        />
    )
};

export default DEPComponent;
