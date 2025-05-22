export const getOrientation = (gender: string, search: string): string =>
{
    let orientation = `${gender}_${search}`;
    
    if(orientation == "woman_man")
    {
        orientation = "man_woman";
    }

    return orientation;
}