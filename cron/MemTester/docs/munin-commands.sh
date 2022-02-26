ln -s /usr/share/munin/plugins/probefreeproc.py /etc/munin/plugins/probefreeproc_10.
0.31.181
vim /usr/share/munin/plugins/probefreeproc.py
./probefreeproc_10.0.31.181 
./probefreeproc_10.0.31.181 config
history 
systemctl restart munin-node


cd /etc/munin/plugins/
ls
ln -s /usr/share/munin/plugins/probefree.py probefree_10.0.31.181
ls
service munin-node restart
uptime
top
