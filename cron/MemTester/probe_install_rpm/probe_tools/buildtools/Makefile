# Build tools targeted for the host architecture, necessary during the build
# process and that we do not want to have checked in to Git.
# This directory is not visited by the regular "make clean" issued by the
# build scripts, but you can call it manually to get rid of the files.
# FIXME: Compile with host-native compiler instead
ifneq ("$(wildcard /etc/debian_version)","")
	platform := debian
	EXTRALIBS = -lrtmp
else
	platform := x86
endif
include ../../lib/btech_platform.mak

CPPFLAGS += -I$(BTECH)/vbc

BUILD := $(realpath .)/build

all: $(BUILD)/tengff

swupl_http: $(BUILD)/swupl_http

$(BUILD)/tengff: $(BUILD)/lib/algo/tengff.o
$(BUILD)/tengff: $(BUILD)/lib/algo/crc.o
$(BUILD)/tengff: $(BUILD)/lib/algo/pack.o
$(BUILD)/tengff: $(BUILD)/lib/algo/unpack.o
$(BUILD)/tengff: $(BUILD)/lib/algo/crypt.o
$(BUILD)/tengff: $(BUILD)/lib/file/srcfile.o
$(BUILD)/tengff: $(BUILD)/lib/debug/print.o
	$(LINK.c) $^ $(LOADLIBES) $(LDLIBS) -o $@

$(BUILD)/swupl_http: $(BUILD)/vbc/tools/src/swupl_http.o
	$(LINK.cc) $^ $(LOADLIBES) $(LDLIBS) -o $@ -lcurl $(EXTRALIBS)

clean:
	-rm -rf build

.PHONY: all clean
include $(BTECH)/lib/btech_buildrules.mak
