import os.path
import yaml
import sys

def setup_config():
    ConfigData = dict(
        LOG="./esxi-vm-create.log",
        isDryRun=False,
        isVerbose=False,
        isSummary=False,
        HOST="10.0.28.202",
        USER="root",
        PASSWORD="",
        CPU=2,
        MEM=4,
        HDISK=20,
        DISKFORMAT="thin",
        VIRTDEV="pvscsi",
        STORE="LeastUsed",
        NET="1Gb",
        ISO="",
        GUESTOS="centos7-64",
        VMXOPTS="",
        MAC="",
    )

    ConfigDataFileLocation = "./esxi-vm.yml"

    if os.path.exists(ConfigDataFileLocation):
        FromFileConfigData = yaml.safe_load(open(ConfigDataFileLocation))
        ConfigData.update(FromFileConfigData)

    try:
        with open(ConfigDataFileLocation, 'w') as FD:
            yaml.dump(ConfigData, FD, default_flow_style=False)
        FD.close()
    except Exception as e:
        print("Unable to create/update config file " + ConfigDataFileLocation)
        print(f"Error exception: {e.msg}")
        sys.exit(1)
    return ConfigData