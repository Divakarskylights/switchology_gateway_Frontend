import warehouse from '../../../assets/icons/warehouse.svg'
import solarCell from '../../../assets/icons/solarcell.svg'
import roadLamp from '../../../assets/images/roadlamp1.png'
import pump from '../../../assets/icons/pump.svg'
import powerTransformer from '../../../assets/icons/powertransformer.svg'
import oilTank from '../../../assets/icons/oiltank.svg'
import network from '../../../assets/images/network1.png'
import manufacturing from '../../../assets/icons/manufacturing.svg'
import light from '../../../assets/icons/light.svg'
import home from '../../../assets/icons/home.svg'
import factory from '../../../assets/icons/factory.svg'
import electricPole from '../../../assets/icons/electricpole.svg'
import electricMotor from '../../../assets/icons/electricmotor.svg'
import electricGenerator from '../../../assets/icons/electricgenerator.svg'
import company from '../../../assets/icons/company.svg'
import charge from '../../../assets/icons/charge.svg'
import carBattery from '../../../assets/icons/carbattery.svg'
import air from '../../../assets/images/air1.png'
import meter from '../../../assets/images/meter.jpeg'
//air,network,road-lamp are png because svg format is not coming properly in the digram screen
export const GlobalDiagram = {
    DiagramScale: { ZOOM_OUT: 0.50, ZOOM_IN: 1 },
    nodeDefinitions: {
        meters: [
            { id: "METER", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 370, category: 'MeterNode', text: 'Meter', img: meter }
        ],
        shapes: [
            { id: "1", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape1', text: 'Warehouse', img: warehouse },
            { id: "2", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape2', text: 'Solar-Cell', img: solarCell },
            { id: "3", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape3', text: 'Road-Lamp', img: roadLamp },
            { id: "4", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape4', text: 'Pump', img: pump },
            { id: "5", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape5', text: 'Power-Transformer', img: powerTransformer },
            { id: "6", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape6', text: 'Oil-Tank', img: oilTank },
            { id: "7", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape7', text: 'Network', img: network },
            { id: "8", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape8', text: 'Manufacturing', img: manufacturing },
            { id: "9", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape9', text: 'Light', img: light },
            { id: "10", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape10', text: 'Home', img: home },
            { id: "11", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape11', text: 'Factory', img: factory },
            { id: "12", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape12', text: 'Electric-Pole', img: electricPole },
            { id: "13", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape13', text: 'Electric-Motor', img: electricMotor },
            { id: "14", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape14', text: 'Electric-Generator', img: electricGenerator },
            { id: "15", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape15', text: 'Company', img: company },
            { id: "16", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape16', text: 'Charge', img: charge },
            { id: "17", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape17', text: 'Car-Battery', img: carBattery },
            { id: "18", shape: 'Rectangle', minWidth: 150, minHeight: 180, maxWidth: 350, maxHeight: 1200, category: 'Shape18', text: 'Air', img: air },
        ]
    },

}
