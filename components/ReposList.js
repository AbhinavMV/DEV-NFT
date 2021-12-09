import * as React from "react";
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import ReposModal from "./ReposModal";
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import SvgPreview from './SvgPreview'

function ReposList({ reposList }) {

    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const [open, setOpen] = useState(false)
    const router = useRouter()

    // const useShareableState = () => {
    //     // Modal show / not-show
    //     const [modalOpen, setModalOpen] = useState(false);
    //     return {
    //         modalopen,
    //         setModalOpen
    //     }
    // }


    // Show the repos informations
    const [githubContent, setGithubContent] = useState({ price: '', name: '', repos_name: '', description: '' })
    async function selectRepo(repos) {
        // console.log("clicked repos =>", repos)

        const reposName = repos.full_name;
        const ownerName = repos.owner.login;
        
        setGithubContent({ name: ownerName, repos_name: reposName, description: repos.description })
        console.log(githubContent) // bug

        setOpen(true)

        // createMarket(reposName, ownerName);
    }

    async function onChange(e) {
        const file = e.target.files[0]
        try {
        const added = await client.add(
            file,
            {
            progress: (prog) => console.log(`received: ${prog}`)
            }
        )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        setFileUrl(url)
        } catch (error) {
        console.log('Error uploading file: ', error)
        }
    }

    async function createMarket(name, description, price) {
        // const { name, description, price } = formInput
        // const { name, description, price } = githubContent

        // where name = reposName
        console.log("createMarket() test:", name, description, price);


        if (!name || !description || !price || !fileUrl) return

        /* first, upload to IPFS */
        const data = JSON.stringify({
        name, description, image: fileUrl
        })

        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`

            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            createSale(url)

        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url) {

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        /* next, create the item */
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        /* then list the item for sale on the marketplace */
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
        await transaction.wait()

        // Maybe we can redirect the user to a 'creation-ok' pages
        // or trigger an tailwind alert!
        // If transaction is successfull, we redirect the user to
        // the dashboard.
        router.push('/dashboard')
    }



        

    return (
        <>
            {/* DIALOG */}
            <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 overflow-auto">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                    <div>
                        <div className="mt-3 text-center sm:mt-5">
                        <div>
                            {/* The svg preview is so large.... it need some fix */}
                            <SvgPreview
                                githubUsername={githubContent.name}
                                selectedRepos={githubContent.repos_name}
                                description={githubContent.description}
                            />
                            <p>github name: {githubContent.name}</p>
                            <p>repos name: {githubContent.repos_name}</p>
                            <p>repos description: {githubContent.description}</p>

                        </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6 space-y-3">
                        <button
                        type="button"
                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
                        onClick={() => setOpen(false)}
                        >
                        Create NFT
                        </button>
                        <button
                        type="button"
                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
                        onClick={() => setOpen(false)}
                        >
                        Go back to dashboard
                        </button>
                    </div>
                    </div>
                </Transition.Child>
                </div>
            </Dialog>
            </Transition.Root>

            <div className="flex flex-col overflow-auto">
                <h2 className="text-2xl font-semibold text-center mt-4">Select your repos</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 m-10">
                    {reposList.map((repos, i) => (
                        <div
                            onClick={() => selectRepo(repos)}
                            key={i}
                            className="cursor-pointer relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                        >
                            <div className="flex-shrink-0">
                                <img className="h-10 w-10 rounded-full" src={repos.owner.avatar_url} alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{repos.full_name}</p>
                                    <p className="text-sm text-gray-500 truncate">{repos.description}</p>
                            </div>
                            <button
                                type="button"
                                className="cursor-auto inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Preview
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )

};

export default ReposList;