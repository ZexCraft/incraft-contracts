const { types } = require("hardhat/config")
const { networks } = require("../../networks")
const fs = require("fs")

task("deploy-incraft", "Deploys the InCraftNFT contract")
  .addOptionalParam("verify", "Set to true to verify contract", false, types.boolean)
  .setAction(async (taskArgs) => {
    console.log(`Deploying InCraftNFT contract to ${network.name}`)

    const params = {
      relRegistry: networks[network.name].relRegistry,
      registry: networks[network.name].registry,
      mintFee: networks[network.name].mintFee,
    }

    console.log("\n__Compiling Contracts__")
    await run("compile")

    console.log(params.relRegistry)
    console.log(params.registry)
    console.log(params.mintFee)
    const inCraftContractFactory = await ethers.getContractFactory("InCraftNFT")
    const inCraftContract = await inCraftContractFactory.deploy(params.relRegistry, params.registry, params.mintFee)

    console.log(
      `\nWaiting ${networks[network.name].confirmations} blocks for transaction ${
        inCraftContract.deployTransaction.hash
      } to be confirmed...`
    )

    await inCraftContract.deployTransaction.wait(networks[network.name].confirmations)

    console.log("\nDeployed InCraftNFT contract to:", inCraftContract.address)

    if (network.name === "localFunctionsTestnet") {
      return
    }

    const verifyContract = taskArgs.verify
    if (
      network.name !== "localFunctionsTestnet" &&
      verifyContract &&
      !!networks[network.name].verifyApiKey &&
      networks[network.name].verifyApiKey !== "UNSET"
    ) {
      try {
        console.log("\nVerifying contract...")
        await run("verify:verify", {
          address: inCraftContract.address,
          constructorArguments: [params.relRegistry, params.registry, params.mintFee],
        })
        console.log("Contract verified")
      } catch (error) {
        if (!error.message.includes("Already Verified")) {
          console.log(
            "Error verifying contract.  Ensure you are waiting for enough confirmation blocks, delete the build folder and try again."
          )
          console.log(error)
        } else {
          console.log("Contract already verified")
        }
      }
    } else if (verifyContract && network.name !== "localFunctionsTestnet") {
      console.log(
        "\nPOLYGONSCAN_API_KEY, ETHERSCAN_API_KEY or FUJI_SNOWTRACE_API_KEY is missing. Skipping contract verification..."
      )
    }

    console.log(`\InCraftNFT contract deployed to ${inCraftContract.address} on ${network.name}`)
  })
