

export default function MessageModal(props)
{
    return(
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-auto sm:w-full sm:max-w-lg h-[250px]">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:flex-col sm:items-center">
                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10">
                                <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-base font-semibold text-gray-900 mt-4" id="modal-title">{ props.message }</h3>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 sm:flex sm:flex-row justify-around mt-10 sm:px-6">
                        <button type="button" onClick={props.setter1} className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-400 sm:mt-0 w-40">{props.msg1}</button>
                        <button type="button" onClick={props.setter2} className="mt-3 inline-flex w-full justify-center rounded-md bg-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-pink-400 sm:mt-0 w-40">{props.msg2}</button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}