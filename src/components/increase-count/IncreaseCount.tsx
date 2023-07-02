
interface IncreaseCountProps {
    bears: number,
    ducks: number,
    onIncreaseBears: (amount: number) => void,
    onIncreaseDucks: (amount: number) => void,
    onAlertMessage: (message: string) => void
}

export default function IncreaseCount(props: IncreaseCountProps) {
    return (
        <div>
            bears: {props.bears}
            <br></br>
            <button onClick={(e) => props.onIncreaseBears(2)}>+</button>

            <br></br>

            ducks: {props.ducks}
            <br></br>
            <button onClick={(e) => props.onIncreaseDucks(2)}>+</button>

            <br></br>
            <br></br>

            <button onClick={(e) => props.onAlertMessage("test")}>alert</button>

        </div>
    );
}