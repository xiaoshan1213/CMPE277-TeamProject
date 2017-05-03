package com.cmpe277.sam.teamprojectclient;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

public class FriendFragment extends Fragment {
    private static final String STARTING_TEXT = "Four Buttons Bottom Navigation";

    public FriendFragment() {
    }

    public static MessageFragment newInstance(String text) {
        Bundle args = new Bundle();
        args.putString(STARTING_TEXT, text);

        MessageFragment messageFragment = new MessageFragment();
        messageFragment.setArguments(args);

        return messageFragment;
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        TextView textView = new TextView(getActivity());
        textView.setText(getArguments().getString(STARTING_TEXT));

        return textView;
    }
}
