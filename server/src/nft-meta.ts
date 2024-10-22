import { badges } from "../../client/src/const/badges"
import fs from 'fs';
import { upload } from "thirdweb/storage";
import fetch from "node-fetch";

const nftMeta = () => {
    badges.map(b => ({
        name: b.name,
        description: b.description,
        image: "ipfs://ipfs/" + b.cid,
        animation_url:"",
        attributes:[],
        type:"image/jpeg"
    })).forEach(b => {
        fs.writeFileSync('../nft-meta/' + b.name, JSON.stringify(b), 'utf-8')
    })
}

const uploadImages = async (images: string[]) => {
    const result = await upload({
        client: { clientId: "633ffbbc8955dc7dc3902ae110d185f8", secretKey: "RbcYWFXQCzu0p4QWng1d0_6Vxx_KryhonCA36ZcyPakmiBFF_EEgkaukmXOfkDB7WyWMQ-LOhC5yjUz1S5SXSw" },
        files: images.map(f => '../client/public/img/badges/' + f + ".jpg"),
    });
    console.log(result)
    console.log(JSON.stringify(result))
    return result
}

const upload3 = async (files: string[]) => {
    const result = await upload({
        client: { clientId: "633ffbbc8955dc7dc3902ae110d185f8", secretKey: "RbcYWFXQCzu0p4QWng1d0_6Vxx_KryhonCA36ZcyPakmiBFF_EEgkaukmXOfkDB7WyWMQ-LOhC5yjUz1S5SXSw" },
        files: files.map(f => fs.readFileSync('../nft-meta/' + f, 'utf-8')),
    });
    console.log(result)
    console.log(JSON.stringify(result))
    return result
}

const badgesUpdate = async () => {
    const files = fs.readdirSync('../nft-meta')
    const ipfs = await upload3(files)
    for (let i = 0; i < files.length; i++) {
        const badge: any = badges.find(b => b.name == files[i])!
        badge.ipfs = ipfs[i].replace("ipfs://", "")
        console.log(badge.name + " -> " + badge.ipfs)
    }
}

const verifyBadgeMeta = async () => {
    for (let i = 0; i < badges.length; i++) {
        const badge = badges[i]
        const response = await fetch('https://ipfs.io/ipfs/' + badge.ipfs)
        const json = await response.json()
        console.log(`${badge.name} -> ${json.name}, ${json.description}, ${json.image} -> ${badge.cid}`)
        if (badge.name !== json.name || 'ipfs://ipfs/' + badge.cid !== json.image) {
            throw "no match for " + badge.name
        }
    }
}

verifyBadgeMeta()